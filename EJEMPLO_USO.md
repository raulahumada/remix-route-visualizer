# Usage Example - Remix Route Visualizer

## Example Project Structure

Suppose you have a Remix project with the following structure:

```
my-remix-app/
├── app/
│   ├── root.tsx
│   └── routes/
│       ├── _index.tsx
│       ├── about.tsx
│       ├── users.tsx
│       ├── users._index.tsx
│       ├── users.$id.tsx
│       ├── users.$id.edit.tsx
│       ├── users.new.tsx
│       ├── _layout.tsx
│       ├── admin.tsx
│       └── api.users.ts
├── package.json
└── remix.config.js
```

## How it's Visualized in the Extension

The extension will show the routes as follows in the "Remix Routes" panel:

```
📁 Remix Routes
├── 🏠 / (root)
├── 📄 /
├── 📄 /about
├── 📄 /users
├── 📄 /users/
├── 🔄 /users/:id
├── 🔄 /users/:id/edit
├── 📄 /users/new
├── 🏗️ /admin (layout)
└── 📋 /api/users (API)
```

## Detected Route Types

### 1. Root Route (`app/root.tsx`)

- **Icon**: 🏠
- **Route**: `/`
- **Type**: layout
- **Description**: Application root component

### 2. Regular Routes

- **File**: `app/routes/about.tsx`
- **Icon**: 📄
- **Route**: `/about`
- **Type**: route

### 3. Index Routes

- **File**: `app/routes/_index.tsx`
- **Icon**: 📄
- **Route**: `/`
- **Type**: route

### 4. Nested Routes

- **File**: `app/routes/users.tsx`
- **Icon**: 📄
- **Route**: `/users`
- **Type**: route

### 5. Dynamic Routes

- **File**: `app/routes/users.$id.tsx`
- **Icon**: 🔄
- **Route**: `/users/:id`
- **Type**: route
- **Note**: Dynamic parameters are automatically highlighted

### 6. Deeply Nested Routes

- **File**: `app/routes/users.$id.edit.tsx`
- **Icon**: 🔄
- **Route**: `/users/:id/edit`
- **Type**: route

### 7. Layouts

- **File**: `app/routes/_layout.tsx`
- **Icon**: 🏗️
- **Route**: `/admin`
- **Type**: layout

### 8. Resource Routes (API)

- **File**: `app/routes/api.users.ts`
- **Icon**: 📋
- **Route**: `/api/users`
- **Type**: resource

## Interactive Features

### Navigation

- **Click** on any route to open the corresponding file
- **Tooltip** shows detailed information when hovering

### Filtering

1. Click on the filter icon 🔍
2. Enter a search term (e.g., "users", ":id", "layout")
3. The list is automatically filtered

### Useful Commands

- **Refresh** (🔄): Manually refresh the list
- **Clear Filter** (🗑️): Remove the current filter
- **Information** (ℹ️): Check if it's a valid Remix project
- **Documentation** (📖): Open official documentation

## Advanced Type Detection

The extension analyzes file content to determine specific types:

### Files with Loader

```typescript
// app/routes/users.tsx
export async function loader() {
  return json({ users: [] });
}

export default function Users() {
  // component
}
```

**Result**: Icon ⏰ with suffix "(loader)"

### Files with Action

```typescript
// app/routes/users.new.tsx
export async function action() {
  // handle POST
}

export default function NewUser() {
  // component
}
```

**Result**: Icon ✅ with suffix "(action)"

### Resource-Only Files

```typescript
// app/routes/api.users.ts
export async function loader() {
  return json({ users: [] });
}

// No export default
```

**Result**: Icon 📋 with suffix "(API)"

## Common Use Cases

### 1. Quick Navigation

- Find the route you need to edit
- Click to open it instantly

### 2. Architecture Exploration

- Visualize the complete route structure
- Identify layouts and nested routes

### 3. Route Debugging

- Verify that routes map correctly
- Find dynamic routes and their parameters

### 4. Refactoring

- Filter by route type to find all layouts
- Identify routes that need to be moved or renamed

## Tips and Tricks

1. **Use the filter** to quickly find specific routes
2. **Tooltips** show the complete route and type
3. **Icons** help you identify route types at a glance
4. **Auto-refresh** keeps the view synchronized
5. **Parameter highlighting** makes it easy to identify dynamic routes
