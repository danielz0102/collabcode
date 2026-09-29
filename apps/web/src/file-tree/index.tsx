"use client"
"use no memo"

import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
  type ItemInstance,
} from "@headless-tree/core"
import { AssistiveTreeDescription, useTree } from "@headless-tree/react"
import { cn } from "cn"
import { FileIcon, FolderClosed, FolderOpen } from "lucide-react"
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type PropsWithChildren,
} from "react"

import { CreateFileInput } from "./create-file-input"

export type Node = {
  name: string
  children?: string[]
}

export type Nodes = Map<string, Node>

const INITIAL_PADDING_PX = 8
const INDENT_PX = 16

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

export function FileTree({ nodes, rootId, className, selectedId, createInput }: FileTreeProps) {
  const tree = useTree<Node>({
    rootItemId: rootId,
    initialState: {
      selectedItems: selectedId ? [selectedId] : [],
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().children !== undefined,
    canReorder: false,
    indent: 24,
    onDrop: createOnDropHandler((item, newChildren) => {
      item.getItemData().children = newChildren
    }),
    canDrop: (_, target) => target.item.isFolder(),
    dataLoader: {
      getItem: (id) => nodes.get(id)!,
      getChildren: (id) => nodes.get(id)?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
    ],
  })

  const { display, onCreate, onCancel } = createInput

  const [targetId, setTargetId] = useState<string | null>(null)
  const openedSelectionRef = useRef("")

  // The ref check must run in the render body so `getItems()` below picks up the
  // scheduled rebuild in this same pass (the file opts out of React Compiler with
  // "use no memo", so the body runs on every render).
  /* oxlint-disable react/refs */
  const nodesRef = useRef(nodes)
  if (nodesRef.current !== nodes) {
    nodesRef.current = nodes
    tree.scheduleRebuildTree()
  }
  /* oxlint-enable react/refs */

  const selectedKey = tree.getState().selectedItems.join("|")

  // The target folder is snapshotted from tree state when the input opens; an
  // effect is required because the trigger comes from the parent's prop.
  /* oxlint-disable react/set-state-in-effect */
  useEffect(() => {
    if (!display) {
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
  }, [display, tree, rootId])
  /* oxlint-enable react/set-state-in-effect */

  useEffect(() => {
    if (!display || targetId === null) return
    if (selectedKey === openedSelectionRef.current) return
    onCancel()
  }, [selectedKey, display, targetId, onCancel])

  const dragTargetId = tree.getDragTarget()?.item.getId()

  const Icon = (item: ItemInstance<Node>) => {
    if (item.isFolder()) {
      return item.isExpanded() ? <FolderOpen size={16} /> : <FolderClosed size={16} />
    }

    return <FileIcon size={16} />
  }

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
    onCreate(name, folderId)
  }

  const showCreateInput = display && targetId !== null

  return (
    <div {...tree.getContainerProps()} className={className}>
      <AssistiveTreeDescription tree={tree} />

      {showCreateInput && targetId === rootId && (
        <CreateFileInput
          paddingLeft={INITIAL_PADDING_PX}
          validate={validate}
          onSubmit={handleCreateSubmit}
          onCancel={onCancel}
        />
      )}

      {tree.getItems().map((item) => {
        const itemId = item.getId()
        const level = item.getItemMeta().level

        return (
          <Fragment key={itemId}>
            <TreeButton
              isSelected={item.isSelected()}
              isInDragArea={
                item.isDragTarget() ||
                (dragTargetId !== undefined && item.isDescendentOf(dragTargetId))
              }
              style={{ paddingLeft: level * INDENT_PX + INITIAL_PADDING_PX }}
              {...item.getProps()}
            >
              {Icon(item)}
              {item.getItemData().name}
            </TreeButton>
            {showCreateInput && itemId === targetId && (
              <CreateFileInput
                paddingLeft={(level + 1) * INDENT_PX + INITIAL_PADDING_PX}
                validate={validate}
                onSubmit={handleCreateSubmit}
                onCancel={onCancel}
              />
            )}
          </Fragment>
        )
      })}

      <div style={tree.getDragLineStyle()} className="dragline dragline-blue-400" />
    </div>
  )
}

type TreeButtonProps = PropsWithChildren<{
  isSelected?: boolean
  isInDragArea?: boolean
}> &
  ComponentProps<"button">

function TreeButton({
  isSelected = false,
  isInDragArea = false,
  children,
  className,
  ...rest
}: TreeButtonProps) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-1 p-1 border-t border-b border-transparent cursor-pointer text-left text-nowrap hover:bg-neutral-700",
        "focus:outline-none focus:bg-neutral-700",
        {
          "bg-neutral-700 border-neutral-600": isSelected,
          "bg-blue-950": isInDragArea,
        },
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
