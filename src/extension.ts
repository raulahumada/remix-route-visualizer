// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { RemixRouteProvider, detectRemixProject } from './remix-route-provider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Remix Route Visualizer is now active!');

  // Obtener la carpeta de workspace
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (!workspaceRoot) {
    vscode.window.showWarningMessage('No workspace folder is open');
    return;
  }

  // Verificar si es un proyecto Remix
  if (!detectRemixProject(workspaceRoot)) {
    vscode.window.showWarningMessage(
      'This does not seem to be a Remix project. The extension works best with Remix projects.'
    );
  }

  // Crear el proveedor de rutas
  const remixRouteProvider = new RemixRouteProvider(workspaceRoot, context);

  // Registrar el proveedor de vista de árbol
  const treeView = vscode.window.createTreeView('remixRoutes', {
    treeDataProvider: remixRouteProvider,
    showCollapseAll: true,
  });

  // Comando para refrescar las rutas
  const refreshCommand = vscode.commands.registerCommand(
    'remix-route-visualizer.refresh',
    () => {
      remixRouteProvider.refreshTree();
      vscode.window.showInformationMessage('Remix routes refreshed');
    }
  );

  // Comando para filtrar rutas
  const filterCommand = vscode.commands.registerCommand(
    'remix-route-visualizer.filter',
    async () => {
      const filter = await vscode.window.showInputBox({
        placeHolder: 'Filter routes (e.g: /users, :id, layout)',
        prompt: 'Enter a term to filter routes',
      });

      if (filter !== undefined) {
        remixRouteProvider.applyFilter(filter);
        vscode.window.showInformationMessage(
          filter ? `Filter applied: "${filter}"` : 'Filter removed'
        );
      }
    }
  );

  // Comando para limpiar filtro
  const clearFilterCommand = vscode.commands.registerCommand(
    'remix-route-visualizer.clearFilter',
    () => {
      remixRouteProvider.applyFilter('');
      vscode.window.showInformationMessage('Filter removed');
    }
  );

  // Comando para mostrar información del proyecto
  const showInfoCommand = vscode.commands.registerCommand(
    'remix-route-visualizer.showInfo',
    () => {
      const isRemix = detectRemixProject(workspaceRoot);
      const message = isRemix
        ? '✅ This is a valid Remix project'
        : '⚠️ This does not seem to be a Remix project';

      vscode.window.showInformationMessage(message);
    }
  );

  // Comando para abrir documentación de Remix
  const openDocsCommand = vscode.commands.registerCommand(
    'remix-route-visualizer.openDocs',
    () => {
      vscode.env.openExternal(
        vscode.Uri.parse(
          'https://remix.run/docs/en/main/file-conventions/routes'
        )
      );
    }
  );

  // Registrar todos los comandos
  context.subscriptions.push(
    treeView,
    refreshCommand,
    filterCommand,
    clearFilterCommand,
    showInfoCommand,
    openDocsCommand,
    remixRouteProvider
  );

  // Configurar eventos de workspace
  const workspaceWatcher = vscode.workspace.onDidChangeWorkspaceFolders(() => {
    remixRouteProvider.refreshTree();
  });

  context.subscriptions.push(workspaceWatcher);

  // Mostrar mensaje de bienvenida
  vscode.window.showInformationMessage(
    'Remix Route Visualizer loaded successfully!'
  );
}

export function deactivate() {
  console.log('Remix Route Visualizer deactivated');
}
