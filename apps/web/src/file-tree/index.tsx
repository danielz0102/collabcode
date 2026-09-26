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
import type { ComponentProps, PropsWithChildren } from "react"

export type Node = {
  name: string
  children?: string[]
}

export type Nodes = Map<string, Node>

const INITIAL_PADDING_PX = 8
const INDENT_PX = 16

type FileTreeProps = {
  nodes: Nodes
  rootId: string
  className?: string
  selectedId?: string
}

export function FileTree({ nodes, rootId, className, selectedId }: FileTreeProps) {
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

  const dragTargetId = tree.getDragTarget()?.item.getId()

  const Icon = (item: ItemInstance<Node>) => {
    if (item.isFolder()) {
      return item.isExpanded() ? <FolderOpen size={16} /> : <FolderClosed size={16} />
    }

    return <FileIcon size={16} />
  }

  return (
    <div {...tree.getContainerProps()} className={className}>
      <AssistiveTreeDescription tree={tree} />

      {tree.getItems().map((item) => (
        <TreeButton
          key={item.getId()}
          isSelected={item.isSelected()}
          isInDragArea={
            item.isDragTarget() || (dragTargetId !== undefined && item.isDescendentOf(dragTargetId))
          }
          style={{ paddingLeft: item.getItemMeta().level * INDENT_PX + INITIAL_PADDING_PX }}
          {...item.getProps()}
        >
          {Icon(item)}
          {item.getItemData().name}
        </TreeButton>
      ))}

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
