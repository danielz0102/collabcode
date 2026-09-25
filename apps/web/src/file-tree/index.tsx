"use client"
"use no memo"

import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
  type ItemInstance,
} from "@headless-tree/core"
import { useTree } from "@headless-tree/react"
import { cn } from "cn"
import { FileIcon, FolderClosed, FolderOpen } from "lucide-react"
import type { ComponentProps, PropsWithChildren } from "react"

export type Node = {
  name: string
  children?: string[]
}

export type Nodes = Map<string, Node>

export function FileTree({ nodes, rootId }: { nodes: Nodes; rootId: string }) {
  const tree = useTree<Node>({
    rootItemId: rootId,
    initialState: {
      selectedItems: [rootId],
      expandedItems: [rootId],
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().children !== undefined,
    dataLoader: {
      getItem: (id) => nodes.get(id)!,
      getChildren: (id) => nodes.get(id)?.children ?? [],
    },
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  })

  const Icon = (item: ItemInstance<Node>) => {
    if (item.isFolder()) {
      return item.isExpanded() ? <FolderOpen size={16} /> : <FolderClosed size={16} />
    }

    return <FileIcon size={16} />
  }

  return (
    <div {...tree.getContainerProps()}>
      {tree.getItems().map((item) => (
        <TreeButton
          key={item.getId()}
          isSelected={item.isSelected()}
          style={{ paddingLeft: item.getItemMeta().level * 16 + 8 }}
          {...item.getProps()}
        >
          {Icon(item)}
          {item.getItemData().name}
        </TreeButton>
      ))}
    </div>
  )
}

type TreeButtonProps = PropsWithChildren<{
  isSelected?: boolean
}> &
  ComponentProps<"button">

function TreeButton({ isSelected = false, children, className, ...rest }: TreeButtonProps) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-1 p-1 cursor-pointer text-left text-nowrap hover:bg-neutral-700 focus-visible:bg-neutral-900 focus-visible:outline-none",
        isSelected && "bg-neutral-700",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
