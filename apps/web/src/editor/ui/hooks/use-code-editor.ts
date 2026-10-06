import { useEffect, useRef } from "react"

import { CodeEditor } from "../editor-view"

export function useCodeEditor(code: string) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) {
      throw new Error("Code editor container ref is not set")
    }

    const editor = new CodeEditor(code, containerRef.current)
    void editor.connect()

    return () => {
      editor.destroy()
    }
  }, [code])

  return { containerRef }
}
