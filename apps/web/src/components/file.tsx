"use client"

import { useEffect, useRef } from "react"

import { Editor } from "@/editor"

export function File({ code }: { code: string }) {
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!parentRef.current) {
      throw new Error("Code editor parent ref is not set")
    }

    let editor: Editor | null = null
    let cancelled = false

    Editor.create(code, parentRef.current)
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

  return <div ref={parentRef} className="h-full" />
}
