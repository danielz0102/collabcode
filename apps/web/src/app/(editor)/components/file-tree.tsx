"use client"

import { cn } from "cn"
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react"
import { createContext, useContext, useState } from "react"

type FileNode = {
  type: "file"
  name: string
  path: string
}

type FolderNode = {
  type: "folder"
  name: string
  path: string
  children: TreeNode[]
}

type TreeNode = FileNode | FolderNode

type FileTreeContextValue = {
  selectedPath: string | null
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

export function FileTree({
  root,
  initialSelectedPath = null,
}: {
  root: FolderNode
  initialSelectedPath?: string | null
}) {
  const [selectedPath, setSelectedPath] = useState<string | null>(initialSelectedPath)

  return (
    <FileTreeContext value={{ selectedPath, select: setSelectedPath }}>
      {root.children.map((child) => (
        <TreeItem key={child.path} node={child} />
      ))}
    </FileTreeContext>
  )
}

function TreeItem({ node, paddingLeft }: { node: TreeNode; paddingLeft?: number }) {
  return node.type === "file" ? (
    <FileItem node={node} paddingLeft={paddingLeft} />
  ) : (
    <FolderItem node={node} paddingLeft={paddingLeft} />
  )
}

function FileItem({ node, paddingLeft = 0 }: { node: FileNode; paddingLeft?: number }) {
  const { selectedPath, select } = useFileTree()

  return (
    <TreeItemButton
      style={{ paddingLeft: paddingLeft + 20 }}
      isSelected={selectedPath === node.path}
      onClick={() => select(node.path)}
    >
      <File size={16} />
      {node.name}
    </TreeItemButton>
  )
}

function FolderItem({ node, paddingLeft = 0 }: { node: FolderNode; paddingLeft?: number }) {
  const { selectedPath, select } = useFileTree()
  const [isOpen, setIsOpen] = useState(false)
  const Arrow = isOpen ? ChevronDown : ChevronRight

  return (
    <>
      <TreeItemButton
        isSelected={selectedPath === node.path}
        style={{ paddingLeft }}
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
          <TreeItem key={child.path} node={child} paddingLeft={paddingLeft + 16} />
        ))}
    </>
  )
}

type TreeItemButtonProps = React.PropsWithChildren<{
  onClick?: () => void
  isSelected?: boolean
  style?: React.CSSProperties
}>

function TreeItemButton({ onClick, isSelected = false, children, style }: TreeItemButtonProps) {
  return (
    <button
      className={cn(
        "flex w-full cursor-pointer items-center gap-1 p-1 text-left text-nowrap select-none hover:bg-neutral-700",
        isSelected && "bg-neutral-700"
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
