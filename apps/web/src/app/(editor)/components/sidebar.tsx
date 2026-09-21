"use client"

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

export function Sidebar({ children }: PropsWithChildren) {
  const [width, setWidth] = useState(300)

  return (
    <aside
      className="relative overflow-hidden border-r border-neutral-600 bg-neutral-800 text-sm"
      style={{ width }}
    >
      {children}
      <RightResizeHandle onHandleMove={(w) => setWidth(clamp(w))} />
    </aside>
  )
}

const MIN_WIDTH = 160
const MAX_WIDTH = 480

function clamp(width: number) {
  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width))
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
