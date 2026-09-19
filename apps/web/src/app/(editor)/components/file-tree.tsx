"use client"

import { cn } from "cn"
import { useState } from "react"

export function FileTree({ className }: { className?: string }) {
  const [width, setWidth] = useState(300)

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden bg-neutral-800", className)}
      style={{ width }}
    >
      <ResizeHandle currentWidth={width} setWidth={setWidth} />
    </div>
  )
}

const MIN_WIDTH = 160
const MAX_WIDTH = 480

function ResizeHandle({
  currentWidth,
  setWidth,
}: {
  currentWidth: number
  setWidth: (width: number) => void
}) {
  return (
    <div
      className="absolute inset-y-0 right-0 w-1 cursor-col-resize hover:bg-neutral-600 active:bg-neutral-500"
      onPointerDown={(event) => {
        event.preventDefault()

        const startX = event.clientX

        const handlePointerMove = (moveEvent: PointerEvent) => {
          const next = currentWidth + (moveEvent.clientX - startX)
          setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next)))
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
