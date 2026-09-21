"use client"

import { Folder, File, ChevronDown, ChevronRight } from "lucide-react"
import { useState, type PropsWithChildren } from "react"

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

export function FileTree({ root }: { root: FolderNode }) {
  return root.children.map((child) => <TreeItem key={child.path} node={child} />)
}

function TreeItem({ node, paddingLeft = 0 }: { node: TreeNode; paddingLeft?: number }) {
  return node.type === "file" ? (
    <FileItem node={node} paddingLeft={paddingLeft + 24} />
  ) : (
    <FolderItem node={node} paddingLeft={paddingLeft} />
  )
}

function FileItem({ node, paddingLeft = 0 }: { node: FileNode; paddingLeft?: number }) {
  return (
    <TreeItemButton paddingLeft={paddingLeft}>
      <File size={16} />
      {node.name}
    </TreeItemButton>
  )
}

function FolderItem({ node, paddingLeft = 0 }: { node: FolderNode; paddingLeft?: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const Arrow = isOpen ? ChevronDown : ChevronRight

  return (
    <>
      <TreeItemButton paddingLeft={paddingLeft} onClick={() => setIsOpen((prev) => !prev)}>
        <Arrow size={16} />
        <Folder size={16} />
        {node.name}
      </TreeItemButton>

      {isOpen &&
        node.children.map((child) => (
          <TreeItem key={child.path} node={child} paddingLeft={16 + paddingLeft} />
        ))}
    </>
  )
}

type TreeItemButtonProps = PropsWithChildren<{
  paddingLeft?: number
  onClick?: () => void
}>

function TreeItemButton({ paddingLeft = 0, onClick, children }: TreeItemButtonProps) {
  return (
    <button
      className="flex w-full cursor-pointer items-center gap-1 p-1 text-left text-nowrap select-none hover:bg-neutral-600"
      style={{ paddingLeft: paddingLeft || 4 }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
