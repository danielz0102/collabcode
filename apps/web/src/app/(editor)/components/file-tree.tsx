"use client"

import { cn } from "cn"
import { useState, type PropsWithChildren } from "react"

export function FileTree({ className }: { className?: string }) {
  const [width, setWidth] = useState(300)

  return (
    <aside
      className={cn("relative shrink-0 overflow-hidden bg-neutral-800 text-sm", className)}
      style={{ width }}
    >
      <TreeNode name="main.ts" selected />
      <TreeNode name="other.ts" />
      <TreeNode name="my-folder">
        <TreeNode name="nested.ts" />
      </TreeNode>
      <RightResizeHandle onHandleMove={(w) => setWidth(clamp(w))} />
    </aside>
  )
}

const MIN_WIDTH = 160
const MAX_WIDTH = 480

function clamp(width: number) {
  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width))
}

type TreeNodeProps = PropsWithChildren<{
  name: string
  selected?: boolean
}>

function TreeNode({ name, selected, children }: TreeNodeProps) {
  return (
    <>
      <button
        className={cn(
          "w-full text-left cursor-pointer hover:bg-neutral-600 p-1",
          selected && "bg-neutral-600"
        )}
      >
        {name}
      </button>
      {children}
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
