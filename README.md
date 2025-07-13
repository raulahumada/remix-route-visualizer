# Remix Route Visualizer

A VS Code extension to visualize and navigate Remix routes in an easy and intuitive way.

## Features

- **Route visualization**: Shows all routes of your Remix application in a hierarchical tree
- **Automatic detection**: Automatically detects if you're working on a Remix project
- **Route types**: Identifies different types of routes (layouts, regular routes, resources, actions, loaders)
- **Quick navigation**: Click on any route to open the corresponding file
- **Filtering**: Filter routes by name or pattern
- **Distinctive icons**: Each route type has its own icon for easy identification
- **Real-time updates**: Automatically updates when you change files

## Supported Remix Conventions

This extension understands Remix route conventions:

- **Regular routes**: `app/routes/users.tsx` → `/users`
- **Nested routes**: `app/routes/users.profile.tsx` → `/users/profile`
- **Dynamic routes**: `app/routes/users.$id.tsx` → `/users/:id`
- **Index routes**: `app/routes/users._index.tsx` → `/users`
- **Layouts**: `app/routes/_layout.tsx` → Shared layout
- **Root route**: `app/root.tsx` → `/`

## Usage

1. Open a Remix project in VS Code
2. The extension will activate automatically
3. Look for the "Remix Routes" panel in the explorer
4. Navigate through your routes and click to open files

## Available Commands

- **Refresh**: Refresh the routes list
- **Filter Routes**: Filter routes by search term
- **Clear Filter**: Remove the current filter
- **Project Information**: Check if the project is a valid Remix project
- **Remix Documentation**: Open the official Remix documentation

## Icons

- 🏠 **Root**: Application root route
- 📄 **Route**: Regular route
- 🏗️ **Layout**: Layout component
- 🔄 **Dynamic**: Route with dynamic parameters
- 📋 **Resource**: Resource route (API)
- ✅ **Action**: Route with action function
- ⏰ **Loader**: Route with loader function

## Requirements

- VS Code 1.102.0 or higher
- Remix project (automatically detected)

## Installation

1. Open VS Code
2. Go to the extensions tab
3. Search for "Remix Route Visualizer"
4. Install the extension

## Contributing

If you find any issues or have suggestions, please open an issue in the project repository.

## License

MIT License
