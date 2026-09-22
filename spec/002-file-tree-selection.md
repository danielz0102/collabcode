---
id: 002
date: 21-09-2026
status: completed
---

# File Tree Selection Highlight

## Overview

Add single-item selection to the `FileTree` component so that, like a real editor, the currently selected item is highlighted. Only one item can be selected at a time.

The selection state lives in a React context provider created inside `apps/web/src/app/(editor)/components/file-tree.tsx`. The `FileTree` root wraps the rendered tree in the provider. Each tree item reads the selected path from context and highlights itself when its own path matches.

### Decisions made during planning

- **State location**: A context provider inside `file-tree.tsx` owns the selection state. The `FileTree` root wraps the tree in the provider.
- **State shape**: Store `selectedPath: string | null` (the path, not the node object). Initial value is `null` (nothing selected).
- **Context API**: Expose `select(path: string)` that sets the selected path. Items call it with `node.path` on click.
- **`isSelected` check**: Each item computes `node.path === selectedPath` and applies the highlight.
- **Folders**: Selectable too. One click on a folder does both — selects it _and_ toggles expansion.
- **No deselect**: Clicking the already-selected item keeps it selected.
- **Highlight style**: `bg-neutral-600` for the selected item — the same shade as the existing hover.
- **No `onFileSelected` prop**: Deferred until the editor integration work happens.

### Alternative approaches considered

- **Lifting state to `page.tsx` and prop-drilling**: More idiomatic for a single level, but the tree is recursive, so `selectedPath` and `select` would have to be threaded through every `TreeItem`/`FolderItem`/`FileItem` at arbitrary depth. Context avoids this.
- **Storing the selected node object instead of the path**: Rejected. Paths are already unique keys in the tree data, so comparing paths is simpler and avoids holding stale object references.

## Tasks

### Task 1: Create the selection context

- **Depends on**: nothing
- **File**: `apps/web/src/app/(editor)/components/file-tree.tsx`
- Create a context that holds the selection state and its setter. Suggested shape:

```tsx
type FileTreeContextValue = {
  selectedPath: string | null
  select: (path: string) => void
}

const FileTreeContext = createContext<FileTreeContextValue | null>(null)
```

- Create a `FileTreeProvider` component that owns `const [selectedPath, setSelectedPath] = useState<string | null>(null)` and provides `{ selectedPath, select: setSelectedPath }`.
- Export a `useFileTree` hook that reads the context and throws if used outside the provider (or returns a sensible default). The hook should be used by tree items to read `selectedPath` and call `select`.

### Task 2: Wrap the tree in the provider

- **Depends on**: Task 1
- **File**: `apps/web/src/app/(editor)/components/file-tree.tsx`
- In the `FileTree` component, wrap the rendered children in `<FileTreeProvider>`:

```tsx
export function FileTree({ root }: { root: FolderNode }) {
  return (
    <FileTreeProvider>
      {root.children.map((child) => (
        <TreeItem key={child.path} node={child} />
      ))}
    </FileTreeProvider>
  )
}
```

### Task 3: Select on click and highlight the selected item

- **Depends on**: Task 1, Task 2
- **File**: `apps/web/src/app/(editor)/components/file-tree.tsx`
- In `FileItem`, call `select(node.path)` when the button is clicked.
- In `FolderItem`, the existing click handler toggles expansion; extend it to also call `select(node.path)` so one click does both.
- In `TreeItemButton`, read `selectedPath` from context (via `useFileTree`) and compute `isSelected = selectedPath === path`. Apply the highlight class when selected. Since `TreeItemButton` currently receives `children` and `onClick`, it needs the item's `path` to compare — either pass `path` as a prop or compute `isSelected` in the item components and pass it down as a boolean prop.
- Suggested approach: pass `isSelected: boolean` down to `TreeItemButton` and apply `bg-neutral-600` conditionally:

```tsx
<button
  className={`flex w-full cursor-pointer items-center gap-1 p-1 text-left text-nowrap select-none hover:bg-neutral-600 ${isSelected ? "bg-neutral-600" : ""}`}
  ...
>
```

- Note: `TreeItemButton` is shared by both `FileItem` and `FolderItem`, so the `isSelected` prop should be wired through both call sites.

## Testing

No test framework exists in the repo, and this change is purely presentational UI state. No automated tests are required. Manual verification:

| Use case               | Input data                         | Expected output                                                                  |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| Select a file          | Click a file item                  | The file item is highlighted with `bg-neutral-600`; no other item is highlighted |
| Select a folder        | Click a folder item                | The folder item is highlighted and its expansion toggles                         |
| Single selection       | Click a second item                | The first item loses its highlight; only the second is highlighted               |
| Re-click selected item | Click the already-highlighted item | It stays highlighted (no deselect)                                               |
| Initial state          | Load the page                      | No item is highlighted                                                           |

## Checklist

- [ ] Task 1: Create the selection context
- [ ] Task 2: Wrap the tree in the provider
- [ ] Task 3: Select on click and highlight the selected item
- [ ] All tests pass (manual verification)
