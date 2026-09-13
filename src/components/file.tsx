"use client"

import { useEffect, useRef } from "react"

import { Editor } from "@/editor"

export function File({ code }: { code: string }) {
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!parentRef.current) {
      throw new Error("Code editor parent ref is not set")
    }

    const editor = new Editor(code, parentRef.current)

    return () => editor.destroy()
  }, [code])

  return <div className="bg-white" ref={parentRef} />
}
