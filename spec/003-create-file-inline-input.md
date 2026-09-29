---
id: 003
date: 29-09-2026
status: completed
---

# Create File Inline Input

## Overview

Make the existing "Add new file" button (`FilePlusCorner` in `apps/web/src/app/(editor)/page.tsx`) behave like VS Code: clicking it displays an inline input **inside the file tree**, positioned at the top of the target folder — the folder of the currently selected file, or the currently selected folder itself (root when nothing/root is selected). The input has a file icon and a text field, validates the name, and on confirmation the parent inserts a real node into the tree data.

### How it works

1. `page.tsx` owns a `createInput.display` boolean. Clicking the button sets it to `true` and passes it to `FileTree` via a new `createInput` prop.
2. When `display` turns `true`, `FileTree` snapshots the target folder from its (tree-internal) selection, auto-expands that folder if collapsed, and renders a new `CreateFileInput` component at the right position in the flat item list.
3. The user types a name. `Enter` validates and, if valid, `FileTree` selects the future item id and calls `createInput.onCreate(name, folderId)`; the parent inserts the node into `nodes` (now React state) at index 0 of the folder's children and sets `display` back to `false`.
4. `Escape`, blur (clicking away), or any selection change while the input is open cancels via `createInput.onCancel()`.
5. Because `@headless-tree` caches the visible item list, `FileTree` schedules a tree rebuild whenever the `nodes` prop changes identity, so the newly inserted file appears.

### Decisions made during planning

- **Single object prop for the feature**: `createInput: { display: boolean; onCreate: (name: string, folderId: string) => void; onCancel: () => void }`. The parent is the source of truth for visibility; the tree reports outcomes. `onCreate` receives `folderId` (amended from a plain `(name)` signature) because the parent owns `nodes` but cannot know the tree-internal selection — the tree is the only one that knows where the file goes.
- **Target folder is snapshotted when the input opens**, from `tree.getSelectedItems()` (last selected item): folder → itself; file → its parent (`item.getParent()`); no selection or root → `rootId`. It is _not_ recomputed if the selection changes afterwards.
- **Any selection change while the input is open cancels it.** In practice blur already covers clicking another row (the input loses focus on `mousedown` before the row's click handler runs), but the selection watcher is kept as an explicit guarantee of the VS Code behavior. Guards ensure `onCancel` fires at most once and that the programmatic selection of the newly created file (which happens in the same batch as `display: false`) does not self-cancel.
- **Insertion**: new node `{ name }` with id `` `${folderId}/${name}` ``, prepended at **index 0** of the folder's `children` — exactly where the input row is shown. The new file is selected immediately (`tree.setSelectedItems([newId])`); the item becomes visible once the tree rebuild picks up the new `nodes`.
- **Auto-expand**: if the target folder is collapsed when the input opens, expand it. (Ancestors of a selected item are always expanded by construction, so the target folder is guaranteed to be visible; the root folder is never rendered as a row and its children are always listed, so it needs no expansion.)
- **Validation** (`FileTree` owns it, since it has `nodes` + target folder):
  - `name.includes("/")` → error, shown **live while typing** (future: `/` may mean "create nested folders").
  - Duplicate name among the target folder's children → error, shown **live while typing**.
  - Empty/whitespace-only name → error, shown **only on `Enter`** (the input starts empty).
  - Name is trimmed before validation and submission. On any error the input stays open; errors clear as the user types.
  - Messages: `A file with this name already exists` / `File name cannot contain '/'` / `File name cannot be empty`.
- **Keys**: `Enter` = confirm (if valid), `Escape` = cancel, **blur = cancel**. Clicking the button while the input is already open is a no-op (`display` is already `true`). To keep that literally true, the button also does `onMouseDown={(e) => e.preventDefault()}` — without it the click would move focus to the button, blur the input (cancel), and reopen it empty, losing the typed text.
- **Error presentation**: the input row is a `relative` container; the red error text is **absolutely positioned** below it, floating over the following row (no extra row height), with a solid background so it stays readable.
- **Tree data sync**: `tree.scheduleRebuildTree()` called during render when `nodes` identity changed — `tree.getItems()` consumes the flag and rebuilds synchronously from the freshest `dataLoader` (which `useTree` has already updated earlier in the same render pass). See alternatives below.

### Alternative approaches considered

- **Nonce/counter prop (`createFileRequest: number`) + tree-internal open state**: rejected in favor of explicit callbacks — the parent must learn about cancellation anyway to reset its state, and an object prop keeps `display`/`onCreate`/`onCancel` together.
- **Imperative handle (`ref.current.startCreateFile()`)**: rejected — requires ref plumbing in `page.tsx` and inverts the declarative data flow used everywhere else.
- **Reusing `@headless-tree`'s `renamingFeature`**: rejected — its state (`renamingItem`) is keyed to an _existing_ item, blur auto-aborts, and it has no concept of a not-yet-created node or of error display. A hand-rolled row gives full control (and rename is out of scope anyway).
- **`useLayoutEffect(() => tree.rebuildTree(), [nodes])`**: rejected — `rebuildTree()` also triggers an extra state flush, and `useLayoutEffect` warns during Next.js server rendering.
- **Remounting the tree with `key={nodesVersion}`**: rejected — would destroy expansion/selection state on every data change.
- **Mutating `nodes` in place like the drop handler does**: rejected — React state must change identity for `page.tsx`/`FileTree` to re-render.

## Tasks

### Task 1: Lift `nodes` into state and wire the button in `page.tsx`

- **Depends on**: nothing (the `createInput` prop type lands in Task 3; `page.tsx` won't typecheck until then)
- **File**: `apps/web/src/app/(editor)/page.tsx`
- Rename the module-level `const nodes` to `initialNodes` (it becomes the initial data only).
- Inside `Editor`, add:

```tsx
const [nodes, setNodes] = useState<Nodes>(() => new Map(initialNodes))
const [createInputDisplay, setCreateInputDisplay] = useState(false)
```

- Give the existing button its handler and `type="button"` (`onMouseDown` prevent-default keeps re-clicks a true no-op — see Decisions; `page.tsx` also needs `"use client"` now that it uses `useState`):

```tsx
<button
  type="button"
  className="cursor-pointer"
  aria-label="Add new file"
  onMouseDown={(event) => event.preventDefault()}
  onClick={() => setCreateInputDisplay(true)}
>
  <FilePlusCorner size={16} />
</button>
```

- Add the create handlers:

```tsx
const handleCreate = (name: string, folderId: string) => {
  const newId = `${folderId}/${name}`
  setNodes((prev) => {
    const next = new Map(prev)
    const folder = next.get(folderId)!
    next.set(folderId, { ...folder, children: [newId, ...(folder.children ?? [])] })
    next.set(newId, { name })
    return next
  })
  setCreateInputDisplay(false)
}

const handleCancelCreate = () => setCreateInputDisplay(false)
```

- Pass the prop to `FileTree`:

```tsx
<FileTree
  nodes={nodes}
  rootId="/root"
  selectedId="/root/main.ts"
  className="h-full"
  createInput={{
    display: createInputDisplay,
    onCreate: handleCreate,
    onCancel: handleCancelCreate,
  }}
/>
```

### Task 2: Create the `CreateFileInput` component

- **Depends on**: nothing
- **File**: `apps/web/src/file-tree/create-file-input.tsx` (new file)
- Presentational component that owns the text value and the current error. Props:

```tsx
type CreateFileInputProps = {
  /** Total left padding for the row, so it lines up with tree items at its level. */
  paddingLeft: number
  /** Returns an error message for a non-empty trimmed name, or null if valid. */
  validate: (name: string) => string | null
  onSubmit: (name: string) => void
  onCancel: () => void
}
```

- Local state: `const [value, setValue] = useState("")` and `const [error, setError] = useState<string | null>(null)`.
- Behavior:
  - Autofocus the `<input>` (use the `autoFocus` attribute).
  - `onChange`: store raw value; re-validate **live** only for non-empty trimmed input (`setError(validate(trimmed))`), clear the error when the field becomes empty (no live "empty" error).
  - `onKeyDown`:
    - `Enter`: `const name = value.trim()`; if empty → `setError("File name cannot be empty")` and return; else `const err = validate(name)` → if set, `setError(err)` and return; else `onSubmit(name)`.
    - `Escape`: `onCancel()` (also `event.stopPropagation()` is not required — tree hotkeys ignore events originating from `HTMLInputElement`).
  - `onBlur`: `onCancel()`.
- Markup / styling — the row must look like a tree row (`TreeButton` in `index.tsx` uses `w-full flex items-center gap-1 p-1`, `text-sm` inherited from `Sidebar`):

```tsx
<div
  role="presentation"
  className="relative w-full flex items-center gap-1 p-1 border-t border-b border-transparent"
  style={{ paddingLeft }}
>
  <FileIcon size={16} />
  <input
    autoFocus
    value={value}
    onChange={...}
    onKeyDown={...}
    onBlur={...}
    className="w-full min-w-0 bg-transparent outline-none"
  />
  {error && (
    <span
      className="absolute top-full z-10 mt-0.5 max-w-max rounded border border-red-800 bg-neutral-900 px-1.5 py-0.5 text-xs whitespace-nowrap text-red-500"
      style={{ left: paddingLeft }}
    >
      {error}
    </span>
  )}
</div>
```

- Import `FileIcon` from `lucide-react` — the same icon files use, so the row reads as "a file being named". Exact error-box styling may be adjusted, but it must be absolutely positioned below the row (no extra layout height), red, and readable over the row beneath it. Add `role="presentation"` so assistive tech does not mistake the row for a tree item.

### Task 3: Add the `createInput` prop to `FileTree`

- **Depends on**: Task 1, Task 2
- **File**: `apps/web/src/file-tree/index.tsx`

**Prop type and state**

```tsx
type CreateInput = {
  display: boolean
  onCreate: (name: string, folderId: string) => void
  onCancel: () => void
}

type FileTreeProps = {
  nodes: Nodes
  rootId: string
  className?: string
  selectedId?: string
  createInput: CreateInput
}
```

- Add component state: `const [targetId, setTargetId] = useState<string | null>(null)` and `const openedSelectionRef = useRef("")`.
- Export `INDENT_PX` / `INITIAL_PADDING_PX` is **not** needed — compute the input row's padding inline (see rendering below).

**Snapshot the target + auto-expand when the input opens**

```tsx
useEffect(() => {
  if (!createInput.display) {
    setTargetId(null)
    return
  }
  const selected = tree.getSelectedItems().at(-1)
  const target = !selected
    ? rootId
    : selected.isFolder()
      ? selected.getId()
      : (selected.getParent()?.getId() ?? rootId)
  openedSelectionRef.current = tree.getState().selectedItems.join("|")
  setTargetId(target)
  if (target !== rootId) {
    const targetItem = tree.getItemInstance(target)
    if (targetItem.isFolder() && !targetItem.isExpanded()) targetItem.expand()
  }
}, [createInput.display, tree, rootId])
```

**Cancel on selection change while open**

```tsx
const selectedKey = tree.getState().selectedItems.join("|")

useEffect(() => {
  if (!createInput.display || targetId === null) return
  if (selectedKey === openedSelectionRef.current) return
  createInput.onCancel()
}, [selectedKey, createInput.display, targetId])
```

Why this does not self-cancel on creation: `setSelectedItems([newId])` and the parent's `setCreateInputDisplay(false)` happen in the same event handler, so React batches them into one commit where `display` is already `false` — the effect early-returns. Likewise, clicking another row fires `onBlur → onCancel` first, and by the time the selection changes, `display` is already `false`.

**Render the input in the flat list**

- If `targetId === rootId` (root is never rendered as a row): render `CreateFileInput` **before** the item list with `paddingLeft={INITIAL_PADDING_PX}`.
- Otherwise render it **immediately after the row whose `item.getId() === targetId`**, with `paddingLeft={(level + 1) * INDENT_PX + INITIAL_PADDING_PX}` where `level = item.getItemMeta().level`.
- This requires wrapping the map body in a `<Fragment key={item.getId()}>` (import from `react`) instead of keying `TreeButton`. Invariant: the target is always visible (see Overview), so no fallback position is needed.
- Only render when `createInput.display && targetId !== null`.

**Validation and handlers** (close over `targetId` and `nodes`)

```tsx
const validate = (name: string): string | null => {
  if (name.includes("/")) return "File name cannot contain '/'"
  const siblings = nodes.get(targetId!)?.children ?? []
  return siblings.some((id) => nodes.get(id)?.name === name)
    ? "A file with this name already exists"
    : null
}

const handleCreateSubmit = (name: string) => {
  const folderId = targetId!
  tree.setSelectedItems([`${folderId}/${name}`])
  createInput.onCreate(name, folderId)
}
```

- Pass `validate`, `onSubmit={handleCreateSubmit}`, `onCancel={createInput.onCancel}` to `CreateFileInput`.
- Do **not** call `rebuildTree()` here — data sync is Task 4's job.

### Task 4: Sync the tree's cached item list when `nodes` changes

- **Depends on**: Task 3
- **File**: `apps/web/src/file-tree/index.tsx`
- `@headless-tree` builds its flat item list once and only rebuilds when told to; the `dataLoader` closures, however, are refreshed by `useTree` on every render. Bridge the two: in the `FileTree` body, **before** the `tree.getItems()` call:

```tsx
const nodesRef = useRef(nodes)
if (nodesRef.current !== nodes) {
  nodesRef.current = nodes
  tree.scheduleRebuildTree()
}
```

- When `getItems()` runs later in the same render pass it sees the scheduled flag and rebuilds synchronously — using the `dataLoader` that `useTree` already updated earlier in that pass (fresh `nodes`). Result: the new file appears in the same commit that added it, with no extra render, no effects, and no SSR warnings.
- Notes for the implementer:
  - `tree.scheduleRebuildTree()` is part of the public typed API (`TreeInstance`), it only sets a flag; `tree.rebuildTree()` must **not** be used here — it rebuilds immediately (stale data at that point) and flushes extra state.
  - Keep the ref check before any `tree.getItems()` usage (including the `tree.getDragTarget()` line — `getDragTarget` is unrelated, but `getItems` itself is the consumer).
  - The file already carries `"use no memo"`, so the render body is guaranteed to run on every render.

## Testing

No test framework exists in the repo (see spec 002); this change is UI behavior — verification is manual via `pnpm dev`, plus `pnpm lint` / `pnpm format` at the repo root.

### Verification notes (recorded when this spec was completed)

- A throwaway jsdom harness (kept outside the repo, in `/tmp/opencode/ftharness`) mounted the real `FileTree` + `CreateFileInput` with a harness mirroring `page.tsx`'s state/handlers and exercised the table below: **44/44 assertions passed**, covering open/target/indent/auto-expand, all three validation messages (live + on-Enter), trim, create-at-index-0 + selection, Escape/blur/selection-change each canceling exactly once, re-click no-op, and highlight regression.
- Not covered by the harness (remains manual): drag & drop regression (needs real pointer geometry) and pixel-level appearance of the floating error box. The drop handler itself was not modified; it still mutates in place and rebuilds itself.
- Root-as-target is reachable only when a file (or no selection) is targeted, since root has no row to select — the `targetId === rootId` rendering branch is covered through that path.
- `pnpm lint` passes with three targeted suppressions for spec-prescribed patterns: `jsx-a11y/no-autofocus` on the `autoFocus` attribute, `react/refs` for the render-phase `nodesRef` check (Task 4), and `react/set-state-in-effect` for the target-snapshot effect (Task 3). `createInput` is destructured so `react-hooks/exhaustive-deps` is satisfied without a suppression.

| Use case                        | Input data                                                                 | Expected output                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Open with file selected         | `selectedId="/root/main.ts"` (root folder), click "Add new file"           | Input row appears at the very top (level 0), inside root, autofocused, with file icon                  |
| Open with folder selected       | Select `/root/nested-folder`, click the button                             | Input row appears directly under `nested-folder`, indented one level deeper                            |
| Auto-expand                     | Select the **collapsed** `deeply-nested-folder`, click the button          | Folder expands and the input appears as its first child                                                |
| Root target                     | Select `/root` (a folder), click the button                                | Input appears at the top of the list (root has no row of its own)                                      |
| Confirm valid name              | Type `new.ts`, press `Enter`                                               | Input closes; `new.ts` exists at index 0 of the target folder, is visible, and is selected/highlighted |
| Duplicate name                  | Type `main.ts` under `/root`, live                                         | Red error `A file with this name already exists` floats below the input; `Enter` keeps it open         |
| Slash rejected                  | Type `a/b.ts`                                                              | Red error `File name cannot contain '/'` shown live; nothing created                                   |
| Empty name                      | Press `Enter` with an empty field                                          | Red error `File name cannot be empty`; input stays open                                                |
| Error clears                    | After an error, keep typing a valid name                                   | Error disappears as soon as the value is valid                                                         |
| Escape cancels                  | Press `Escape`                                                             | Input closes, no node added                                                                            |
| Blur cancels                    | Click anywhere outside the input (e.g. another row)                        | Input closes, no node added                                                                            |
| Selection change cancels        | (Belt-and-suspenders for the blur case) select a different file while open | Input closes, no node added, exactly one `onCancel` call                                               |
| Re-click button                 | Click "Add new file" while the input is open                               | No-op, input untouched                                                                                 |
| Trim                            | Type `  spaced.ts  `, `Enter`                                              | Creates `spaced.ts` (trimmed)                                                                          |
| Regression: drag & drop         | Drag `main.ts` into `nested-folder`                                        | Still works (drop handler mutates in place and rebuilds itself)                                        |
| Regression: selection/highlight | Click files and folders                                                    | Highlight, folder toggling unchanged; new files behave like any other item                             |
| Lint                            | `pnpm lint`, `pnpm format`                                                 | No errors / no diff                                                                                    |

## Checklist

- [x] Task 1: Lift `nodes` into state and wire the button in `page.tsx`
- [x] Task 2: Create the `CreateFileInput` component
- [x] Task 3: Add the `createInput` prop to `FileTree` (target snapshot, expand, render, validate, submit/cancel)
- [x] Task 4: Sync the tree's cached item list when `nodes` changes
- [x] All manual test cases pass (44/44 automated via throwaway jsdom harness; drag & drop and visual styling remain manual — see Verification notes)
- [x] `pnpm lint` and `pnpm format` pass
