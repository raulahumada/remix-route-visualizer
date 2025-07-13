# Changelog

All notable changes to this project will be documented in this file.

## [0.0.2] - 2024-12-27

### Changed

- Reduced minimum VS Code version requirement from 1.102.0 to 1.74.0 for Cursor compatibility

## [0.0.1] - 2024-12-27

### Added

- Remix routes visualization in explorer panel
- Automatic Remix project detection
- Support for all Remix route conventions:
  - Regular routes (`app/routes/users.tsx`)
  - Nested routes (`app/routes/users.profile.tsx`)
  - Dynamic routes (`app/routes/users.$id.tsx`)
  - Index routes (`app/routes/users._index.tsx`)
  - Layouts (`app/routes/_layout.tsx`)
  - Root route (`app/root.tsx`)
- Route type identification (layout, route, resource, action, loader)
- Distinctive icons for each route type
- Command to refresh routes
- Command to filter routes
- Command to clear filters
- Command to show project information
- Command to open Remix documentation
- Quick navigation by clicking on routes
- Automatic updates when files change
- Informative tooltips with routes and types
- Dynamic parameter highlighting in routes

### Technical Features

- TypeScript and JavaScript support
- Support for .tsx, .ts, .jsx, .js files
- Detection based on Remix dependencies in package.json
- File watcher for real-time updates
- Route filtering by name or pattern
- Alphabetical route sorting
