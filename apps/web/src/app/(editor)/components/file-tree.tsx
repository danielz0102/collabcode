"use client"

import { cn } from "cn"
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react"
import {
  createContext,
  useContext,
  useState,
  type ComponentProps,
  type PropsWithChildren,
} from "react"

type FileNode = {
  type: "file"
} & CommonNodeProps

type FolderNode = {
  type: "folder"
  children: TreeNode[]
} & CommonNodeProps

type CommonNodeProps = {
  name: string
  path: string
  selected?: boolean
}

type TreeNode = FileNode | FolderNode

class Tree {
  constructor(public root: FolderNode) {}

  select(path: string): Tree {
    const newRoot = this.map(this.root, (node) => ({
      ...node,
      selected: node.path === path,
    }))

    return new Tree(newRoot)
  }

  private map<T extends TreeNode>(node: T, fn: <N extends TreeNode>(node: N) => N): T {
    const updatedNode = fn(node)

    if (updatedNode.type === "folder") {
      return {
        ...updatedNode,
        children: updatedNode.children.map((c) => this.map(c, fn)),
      }
    }

    return updatedNode
  }
}

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
      {tree.root.children.map((child) => (
        <TreeItem key={child.path} node={child} />
      ))}
    </FileTreeContext>
  )
}

function TreeItem({ node, indent }: { node: TreeNode; indent?: number }) {
  return node.type === "file" ? (
    <FileItem node={node} indent={indent} />
  ) : (
    <FolderItem node={node} indent={indent} />
  )
}

function FileItem({ node, indent = 0 }: { node: FileNode; indent?: number }) {
  const { select } = useFileTree()

  return (
    <TreeItemButton
      style={{ paddingLeft: indent + 20 }}
      isSelected={node.selected}
      onClick={() => select(node.path)}
    >
      <File size={16} />
      {node.name}
    </TreeItemButton>
  )
}

function FolderItem({ node, indent = 0 }: { node: FolderNode; indent?: number }) {
  const { select } = useFileTree()
  const [isOpen, setIsOpen] = useState(false)
  const Arrow = isOpen ? ChevronDown : ChevronRight

  return (
    <>
      <TreeItemButton
        isSelected={node.selected}
        style={{ paddingLeft: indent }}
        onClick={() => {
          select(node.path)
          setIsOpen((prev) => !prev)
        }}
      >
        <Arrow size={16} />
        <Folder size={16} />
        {node.name}
      </TreeItemButton>

      {isOpen &&
        node.children.map((child) => (
          <TreeItem key={child.path} node={child} indent={indent + 16} />
        ))}
    </>
  )
}

type TreeItemButtonProps = PropsWithChildren<{
  isSelected?: boolean
}> &
  ComponentProps<"button">

function TreeItemButton({ isSelected = false, children, className, ...rest }: TreeItemButtonProps) {
  return (
    <button
      className={cn(
        "flex w-full cursor-pointer items-center gap-1 p-1 text-left text-nowrap select-none hover:bg-neutral-700",
        isSelected && "bg-neutral-700",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
