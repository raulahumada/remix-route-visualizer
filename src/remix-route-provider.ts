import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Representa un elemento de ruta de Remix en el árbol de VS Code
 */
export class RemixRouteItem extends vscode.TreeItem {
  public readonly filePath: string;
  public readonly routeUrl: string;
  public readonly routeCategory: RouteCategory;

  constructor(
    displayLabel: string | vscode.TreeItemLabel,
    filePath: string,
    routeUrl: string,
    routeCategory: RouteCategory,
    context: vscode.ExtensionContext
  ) {
    super(displayLabel, vscode.TreeItemCollapsibleState.None);

    this.filePath = filePath;
    this.routeUrl = routeUrl;
    this.routeCategory = routeCategory;

    // Configurar tooltip informativo
    this.tooltip = this.generateTooltip();
    this.contextValue = 'remixRouteItem';

    // Configurar comando para abrir archivo
    this.command = {
      command: 'vscode.open',
      title: 'Open route file',
      arguments: [vscode.Uri.file(filePath)],
    };

    // Asignar icono basado en el tipo de ruta
    this.iconPath = this.getIconForRouteType(routeCategory, context);
  }

  private generateTooltip(): string {
    const workspaceRoot =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    const relativePath = path.relative(workspaceRoot, this.filePath);

    return [
      `U  RL: ${this.routeUrl}`,
      `Type: ${this.getCategoryDisplayName()}`,
      `File: ${relativePath}`,
    ].join('\n');
  }

  private getCategoryDisplayName(): string {
    const categoryNames: Record<RouteCategory, string> = {
      root: 'Root route',
      page: 'Page',
      layout: 'Layout',
      dynamic: 'Dynamic route',
      api: 'API route',
      action: 'Action',
      loader: 'Loader',
    };
    return categoryNames[this.routeCategory];
  }

  private getIconForRouteType(
    category: RouteCategory,
    context: vscode.ExtensionContext
  ) {
    const iconMap: Record<RouteCategory, string> = {
      root: 'root-icon.svg',
      page: 'route-icon.svg',
      layout: 'layout-icon.svg',
      dynamic: 'dynamic-icon.svg',
      api: 'resource-icon.svg',
      action: 'action-icon.svg',
      loader: 'loader-icon.svg',
    };

    const iconFile = iconMap[category];
    const iconPath = context.asAbsolutePath(path.join('resources', iconFile));

    return {
      light: vscode.Uri.file(iconPath),
      dark: vscode.Uri.file(iconPath),
    };
  }
}

/**
 * Tipos de rutas que puede reconocer la extensión
 */
type RouteCategory =
  | 'root'
  | 'page'
  | 'layout'
  | 'dynamic'
  | 'api'
  | 'action'
  | 'loader';

/**
 * Información de una ruta procesada
 */
interface RouteInfo {
  filePath: string;
  urlPath: string;
  category: RouteCategory;
  fileName: string;
}

/**
 * Data provider for the Remix routes tree
 */
export class RemixRouteProvider
  implements vscode.TreeDataProvider<RemixRouteItem>
{
  private treeDataChanged = new vscode.EventEmitter<
    RemixRouteItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this.treeDataChanged.event;

  private fileWatchers: vscode.FileSystemWatcher[] = [];
  private searchFilter = '';

  constructor(
    private readonly workspaceRoot: string,
    private readonly extensionContext: vscode.ExtensionContext
  ) {
    this.initializeFileWatchers();
  }

  /**
   * Configures file watchers to detect changes
   */
  private initializeFileWatchers(): void {
    const watchPatterns = [
      'app/routes/**/*.{js,ts,jsx,tsx}',
      'app/root.{js,ts,jsx,tsx}',
      'routes/**/*.{js,ts,jsx,tsx}',
    ];

    watchPatterns.forEach((pattern) => {
      const watcher = vscode.workspace.createFileSystemWatcher(pattern);

      watcher.onDidCreate(() => this.notifyTreeChange());
      watcher.onDidDelete(() => this.notifyTreeChange());
      watcher.onDidChange(() => this.notifyTreeChange());

      this.fileWatchers.push(watcher);
    });
  }

  /**
   * Apply a search filter to the routes
   */
  applyFilter(filterText: string): void {
    this.searchFilter = filterText.trim().toLowerCase();
    this.notifyTreeChange();
  }

  /**
   * Refresh the routes tree manually
   */
  refreshTree(): void {
    this.notifyTreeChange();
  }

  /**
   * Notify changes in the tree
   */
  private notifyTreeChange(): void {
    this.treeDataChanged.fire();
  }

  /**
   * Implementation required by TreeDataProvider
   */
  getTreeItem(element: RemixRouteItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get the child elements of the tree
   */
  async getChildren(element?: RemixRouteItem): Promise<RemixRouteItem[]> {
    if (element) {
      return []; // No hay elementos anidados
    }

    try {
      const routeFiles = await this.discoverRouteFiles();
      const routeInfos = await this.processRouteFiles(routeFiles);
      const filteredRoutes = this.applySearchFilter(routeInfos);

      return this.createTreeItems(filteredRoutes);
    } catch (error) {
      console.error('Error al obtener rutas:', error);
      return [];
    }
  }

  /**
   * Discover all route files in the project
   */
  private async discoverRouteFiles(): Promise<vscode.Uri[]> {
    const searchPatterns = [
      'app/routes/**/*.{js,ts,jsx,tsx}',
      'app/root.{js,ts,jsx,tsx}',
      'routes/**/*.{js,ts,jsx,tsx}',
    ];

    const allFiles: vscode.Uri[] = [];

    for (const pattern of searchPatterns) {
      const matchingFiles = await vscode.workspace.findFiles(
        pattern,
        '**/node_modules/**'
      );
      allFiles.push(...matchingFiles);
    }

    return allFiles;
  }

  /**
   * Process route files and extract information
   */
  private async processRouteFiles(files: vscode.Uri[]): Promise<RouteInfo[]> {
    const routeInfos: RouteInfo[] = [];

    for (const file of files) {
      try {
        const routeInfo = await this.analyzeRouteFile(file);
        if (routeInfo) {
          routeInfos.push(routeInfo);
        }
      } catch (error) {
        console.warn(`Error procesando archivo ${file.fsPath}:`, error);
      }
    }

    return routeInfos;
  }

  /**
   * Analyze an individual route file
   */
  private async analyzeRouteFile(file: vscode.Uri): Promise<RouteInfo | null> {
    const relativePath = path.relative(this.workspaceRoot, file.fsPath);
    const fileName = path.basename(file.fsPath, path.extname(file.fsPath));

    // Manejar archivo root especialmente
    if (fileName === 'root') {
      return {
        filePath: file.fsPath,
        urlPath: '/',
        category: 'root',
        fileName,
      };
    }

    const urlPath = this.convertFilePathToUrl(relativePath);
    const category = await this.determineRouteCategory(file);

    return {
      filePath: file.fsPath,
      urlPath,
      category,
      fileName,
    };
  }

  /**
   * Convert the file path to URL following Remix conventions
   */
  private convertFilePathToUrl(filePath: string): string {
    let urlPath = filePath
      // Remover prefijos de directorios
      .replace(/^app[\/\\]routes[\/\\]/, '')
      .replace(/^routes[\/\\]/, '')
      // Remover extensiones
      .replace(/\.(js|ts|jsx|tsx)$/, '');

    urlPath = urlPath
      // Convert dots to slashes (nested routes)
      .replace(/\./g, '/')
      // Convert dynamic parameters ($param -> :param)
      .replace(/\$([^\/\\]+)/g, ':$1')
      // Handle index routes
      .replace(/[\/\\]_index$/, '')
      .replace(/^_index$/, '')
      // Handle layouts (remove _ prefix)
      .replace(/[\/\\]_([^\/\\]+)/g, '/$1')
      .replace(/^_([^\/\\]+)/, '$1');

    // Normalize and clean
    urlPath = urlPath
      .replace(/[\/\\]+/g, '/')
      .replace(/\/$/, '')
      .replace(/^\/?/, '/');

    return urlPath || '/';
  }

  /**
   * Determine the category of a route based on the file
   */
  private async determineRouteCategory(
    file: vscode.Uri
  ): Promise<RouteCategory> {
    const fileName = path.basename(file.fsPath);

    // Check if it's a layout
    if (fileName.startsWith('_') && !fileName.includes('index')) {
      return 'layout';
    }

    // Check if it's an API/resource route
    if (fileName.includes('.') && !fileName.match(/\.(jsx?|tsx?)$/)) {
      return 'api';
    }

    // Analyze file content
    try {
      const fileContent = await fs.promises.readFile(file.fsPath, 'utf8');
      return this.categorizeByContent(fileContent, fileName);
    } catch (error) {
      console.warn(`No se pudo leer el archivo ${file.fsPath}:`, error);
      return 'page';
    }
  }

  /**
   * Categorize a route based on its content
   */
  private categorizeByContent(
    content: string,
    fileName: string
  ): RouteCategory {
    const hasDefaultExport =
      /export\s+default\s+/.test(content) ||
      /export\s*\{\s*default\s*\}/.test(content);
    const hasAction = /export\s+async\s+function\s+action/.test(content);
    const hasLoader = /export\s+async\s+function\s+loader/.test(content);

    // Determine category based on exports
    if (!hasDefaultExport && hasAction) {
      return 'action';
    }

    if (!hasDefaultExport && hasLoader) {
      return 'loader';
    }

    // Check if it's a dynamic route by filename
    if (fileName.includes('$')) {
      return 'dynamic';
    }

    return 'page';
  }

  /**
   * Apply search filter to routes
   */
  private applySearchFilter(routes: RouteInfo[]): RouteInfo[] {
    if (!this.searchFilter) {
      return routes;
    }

    return routes.filter((route) => {
      const searchTerms = [
        route.urlPath.toLowerCase(),
        route.fileName.toLowerCase(),
        path.basename(route.filePath).toLowerCase(),
      ];

      return searchTerms.some((term) => term.includes(this.searchFilter));
    });
  }

  /**
   * Create tree items from route information
   */
  private createTreeItems(routes: RouteInfo[]): RemixRouteItem[] {
    const sortedRoutes = this.sortRoutes(routes);

    return sortedRoutes.map((route) => {
      const displayLabel = this.createDisplayLabel(route);

      return new RemixRouteItem(
        displayLabel,
        route.filePath,
        route.urlPath,
        route.category,
        this.extensionContext
      );
    });
  }

  /**
   * Sort routes alphabetically
   */
  private sortRoutes(routes: RouteInfo[]): RouteInfo[] {
    return routes.sort((a, b) => {
      // Priorizar ruta root
      if (a.category === 'root') return -1;
      if (b.category === 'root') return 1;

      return a.urlPath.localeCompare(b.urlPath);
    });
  }

  /**
   * Create the display label for a route
   */
  private createDisplayLabel(route: RouteInfo): vscode.TreeItemLabel {
    let displayText = route.urlPath;

    // Agregar sufijo descriptivo para ciertos tipos
    const suffixes: Partial<Record<RouteCategory, string>> = {
      root: ' (root)',
      layout: ' (layout)',
      api: ' (API)',
      action: ' (action)',
      loader: ' (loader)',
    };

    if (suffixes[route.category]) {
      displayText += suffixes[route.category];
    }

    // Crear highlights para parámetros dinámicos
    const highlights = this.findDynamicParameterHighlights(route.urlPath);

    return {
      label: displayText,
      highlights,
    };
  }

  /**
   * Find the positions of dynamic parameters to highlight them
   */
  private findDynamicParameterHighlights(urlPath: string): [number, number][] {
    const highlights: [number, number][] = [];
    const parameterRegex = /:([^\/]+)/g;
    let match;

    while ((match = parameterRegex.exec(urlPath)) !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;
      highlights.push([startIndex, endIndex]);
    }

    return highlights;
  }

  /**
   * Clean up resources when disposing the provider
   */
  dispose(): void {
    this.fileWatchers.forEach((watcher) => watcher.dispose());
    this.fileWatchers = [];
  }
}

/**
 * Check if the current directory contains a Remix project
 */
export function detectRemixProject(workspaceRoot: string): boolean {
  try {
    const packageJsonPath = path.join(workspaceRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }

    const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageData = JSON.parse(packageContent);

    const remixDependencies = [
      '@remix-run/node',
      '@remix-run/react',
      '@remix-run/serve',
      '@remix-run/dev',
    ];

    const allDependencies = {
      ...packageData.dependencies,
      ...packageData.devDependencies,
    };

    return remixDependencies.some((dep) => dep in allDependencies);
  } catch (error) {
    console.error('Error detecting Remix project:', error);
    return false;
  }
}
