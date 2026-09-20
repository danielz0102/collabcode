"use client"

import { cn } from "cn"
import { useState } from "react"

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
  return (
    <button className="ui-tree-item-button" style={{ paddingLeft: paddingLeft || 4 }}>
      {node.name}
    </button>
  )
}

function FolderItem({ node, paddingLeft = 0 }: { node: FolderNode; paddingLeft?: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="ui-tree-item-button"
        style={{ paddingLeft: paddingLeft || 4 }}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {node.name}
      </button>

      {isOpen &&
        node.children.map((child) => (
          <TreeItem key={child.path} node={child} paddingLeft={16 + paddingLeft} />
        ))}
    </>
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
