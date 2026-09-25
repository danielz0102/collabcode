"use client"

import { cn } from "cn"
import { ChevronDown, ChevronRight, FileIcon, FolderIcon } from "lucide-react"
import {
  Activity,
  createContext,
  useContext,
  useState,
  type ComponentProps,
  type PropsWithChildren,
} from "react"

import { Tree, type FileNode, type FolderNode, type TreeNode } from "./tree"

type FileTreeContextValue = {
  select: (path: string) => void
}

const FileTreeContext = createContext<FileTreeContextValue | null>(null)

function useFileTree() {
  const context = useContext(FileTreeContext)

  if (!context) {
    throw new Error("useFileTree must be used within a FileTree")
  }

  return context
}

type FileTreeProps = {
  root: FolderNode
  onUpdate?: (root: FolderNode) => void
}

export function FileTree({ root }: FileTreeProps) {
  const [tree, setTree] = useState(new Tree(root))

  return (
    <FileTreeContext value={{ select: (path) => setTree(tree.select(path)) }}>
      <div role="tree">
        {tree.root.children.map((n) => (
          <Node key={n.path} node={n} depth={0} />
        ))}
      </div>
    </FileTreeContext>
  )
}

function Node({ node, depth }: { node: TreeNode; depth: number }) {
  return node.type === "file" ? (
    <FileItem node={node} depth={depth} />
  ) : (
    <FolderItem node={node} depth={depth} />
  )
}

const INDENT_PX = 16
const INITIAL_PADDING = 4
const CHEVRON_SPACE_PX = 20

const computePadding = (depth: number) => INITIAL_PADDING + depth * INDENT_PX

function FileItem({ node, depth }: { node: FileNode; depth: number }) {
  const { select } = useFileTree()

  return (
    <TreeItem isSelected={node.selected}>
      <TreeButton
        style={{ paddingLeft: computePadding(depth) + CHEVRON_SPACE_PX }}
        isSelected={node.selected}
        onClick={() => select(node.path)}
      >
        <FileIcon size={16} />
        {node.name}
      </TreeButton>
    </TreeItem>
  )
}

function FolderItem({ node, depth }: { node: FolderNode; depth: number }) {
  const { select } = useFileTree()
  const [isOpen, setIsOpen] = useState(false)
  const ChevronIcon = isOpen ? ChevronDown : ChevronRight

  return (
    <TreeItem isExpanded={isOpen} isSelected={node.selected}>
      <TreeButton
        style={{ paddingLeft: computePadding(depth) }}
        isSelected={node.selected}
        onClick={() => {
          select(node.path)
          setIsOpen((prev) => !prev)
        }}
      >
        <ChevronIcon size={16} />
        <FolderIcon size={16} />
        {node.name}
      </TreeButton>

      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <div role="group">
        <Activity mode={isOpen ? "visible" : "hidden"}>
          {node.children.map((n) => (
            <Node key={n.path} node={n} depth={depth + 1} />
          ))}
        </Activity>
      </div>
    </TreeItem>
  )
}

type TreeItemProps = PropsWithChildren<{
  isExpanded?: boolean
  isSelected?: boolean
}>

function TreeItem({ isExpanded, isSelected, children }: TreeItemProps) {
  return (
    <div role="treeitem" aria-expanded={isExpanded} aria-selected={isSelected}>
      {children}
    </div>
  )
}

type TreeButtonProps = PropsWithChildren<{
  isSelected?: boolean
}> &
  ComponentProps<"span">

function TreeButton({ isSelected = false, children, className, ...rest }: TreeButtonProps) {
  return (
    <span
      className={cn(
        "flex w-full cursor-pointer items-center gap-1 py-1 text-left text-nowrap select-none hover:bg-neutral-700",
        isSelected && "bg-neutral-700",
        className
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
