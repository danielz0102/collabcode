"use client"

import { cn } from "cn"
import { ChevronDown, ChevronRight, FileIcon, FolderIcon } from "lucide-react"
import {
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
      {tree.root.children.map((node) => (
        <Node key={node.path} node={node} />
      ))}
    </FileTreeContext>
  )
}

function Node({ node, indent }: { node: TreeNode; indent?: number }) {
  return node.type === "file" ? (
    <FileItem node={node} indent={indent} />
  ) : (
    <FolderItem node={node} indent={indent} />
  )
}

function FileItem({ node, indent = 0 }: { node: FileNode; indent?: number }) {
  const { select } = useFileTree()

  return (
    <TreeItem
      style={{ paddingLeft: indent + 20 }}
      isSelected={node.selected}
      onClick={() => select(node.path)}
    >
      <FileIcon size={16} />
      {node.name}
    </TreeItem>
  )
}

function FolderItem({ node }: { node: FolderNode; indent?: number }) {
  const { select } = useFileTree()
  const [isOpen, setIsOpen] = useState(false)
  const ChevronIcon = isOpen ? ChevronDown : ChevronRight

  return (
    <>
      <TreeItem
        isSelected={node.selected}
        aria-expanded={isOpen}
        onClick={() => {
          select(node.path)
          setIsOpen((prev) => !prev)
        }}
      >
        <ChevronIcon size={16} />
        <FolderIcon size={16} />
        {node.name}
      </TreeItem>
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <div role="group" className="pl-4">
        {isOpen && node.children.map((n) => <Node key={n.path} node={n} />)}
      </div>
    </>
  )
}

type TreeItemProps = PropsWithChildren<{
  isSelected?: boolean
}> &
  ComponentProps<"div">

function TreeItem({ isSelected = false, children, className, ...rest }: TreeItemProps) {
  return (
    <div
      role="treeitem"
      aria-selected={isSelected}
      className={cn(
        "flex w-full cursor-pointer items-center gap-1 p-1 text-left text-nowrap select-none hover:bg-neutral-700",
        isSelected && "bg-neutral-700",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
