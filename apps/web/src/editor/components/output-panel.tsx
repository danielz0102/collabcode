"use client"

import { useRef, useState, type CSSProperties, type PropsWithChildren } from "react"

export function OutputPanel({ children }: PropsWithChildren) {
  const [width, setWidth] = useState(400)
  const panelRef = useRef<HTMLBaseElement>(null)

  const handleResize = (clientX: number) => {
    if (!panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    // Panel is on the right, so width = right edge - mouse position
    const newWidth = rect.right - clientX
    setWidth(newWidth)
  }

  return (
    <aside
      ref={panelRef}
      className="relative w-[clamp(50px,var(--w),980px)] border-l border-neutral-600 bg-neutral-800 px-4 py-2 text-sm"
      style={{ "--w": `${width}px` } as CSSProperties}
    >
      <code>{children}</code>
      <LeftResizeHandle onHandleMove={handleResize} />
    </aside>
  )
}

function LeftResizeHandle({ onHandleMove }: { onHandleMove: (clientX: number) => void }) {
  return (
    <div
      className="absolute inset-y-0 left-0 w-1 cursor-col-resize hover:bg-neutral-600 active:bg-neutral-500"
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
