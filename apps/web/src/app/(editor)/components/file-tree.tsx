"use client"

import { cn } from "cn"
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

type FileTreeProps = {
  root: FolderNode
  className?: string
}

export function FileTree({ root, className }: FileTreeProps) {
  const [width, setWidth] = useState(300)

  return (
    <aside
      className={cn(
        "relative border-r border-neutral-600 overflow-hidden bg-neutral-800 text-sm",
        className
      )}
      style={{ width }}
    >
      {root.children.map((child) => (
        <TreeItem key={child.path} node={child} />
      ))}
      <RightResizeHandle onHandleMove={(w) => setWidth(clamp(w))} />
    </aside>
  )
}

const MIN_WIDTH = 160
const MAX_WIDTH = 480

function clamp(width: number) {
  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width))
}

function TreeItem({ node, paddingLeft = 0 }: { node: TreeNode; paddingLeft?: number }) {
  return node.type === "file" ? (
    <FileItem node={node} paddingLeft={paddingLeft} />
  ) : (
    <FolderItem node={node} paddingLeft={paddingLeft} />
  )
}

function FileItem({ node, paddingLeft = 0 }: { node: FileNode; paddingLeft?: number }) {
  return <TreeItemButton paddingLeft={paddingLeft}>{node.name}</TreeItemButton>
}

function FolderItem({ node, paddingLeft = 0 }: { node: FolderNode; paddingLeft?: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <TreeItemButton paddingLeft={paddingLeft} onClick={() => setIsOpen((prev) => !prev)}>
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
      className="w-full cursor-pointer p-1 text-left text-nowrap select-none hover:bg-neutral-600"
      style={{ paddingLeft: paddingLeft || 4 }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function RightResizeHandle({ onHandleMove }: { onHandleMove: (pos: number) => void }) {
  return (
    <div
      className="absolute inset-y-0 right-0 w-1 cursor-col-resize hover:bg-neutral-600 active:bg-neutral-500"
      onPointerDown={(event) => {
        event.preventDefault()

        const handlePointerMove = (moveEvent: PointerEvent) => {
          onHandleMove(moveEvent.clientX)
        }

        const handlePointerUp = () => {
          window.removeEventListener("pointermove", handlePointerMove)
          window.removeEventListener("pointerup", handlePointerUp)
        }

        window.addEventListener("pointermove", handlePointerMove)
        window.addEventListener("pointerup", handlePointerUp)
      }}
    />
  )
}
