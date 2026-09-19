"use client"

import { useEffect, useRef } from "react"

import { Editor } from "@/editor"

export function Document({ code }: { code: string }) {
  const { containerRef } = useCodeEditor(code)
  return <div ref={containerRef} className="h-full" />
}

function useCodeEditor(code: string) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) {
      throw new Error("Code editor container ref is not set")
    }

    let editor: Editor | null = null
    let cancelled = false

    Editor.create(code, containerRef.current)
      .then((created) => {
        if (cancelled) created.destroy()
        else editor = created
      })
      .catch((error) => {
        console.error("Failed to initialize code editor", error)
      })

    return () => {
      cancelled = true
      editor?.destroy()
    }
  }, [code])

  return { containerRef }
}
