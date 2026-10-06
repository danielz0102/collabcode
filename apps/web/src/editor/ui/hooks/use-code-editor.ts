import { useEffect, useRef, useState } from "react"

import { CodeEditor } from "../editor-view"

export function useCodeEditor(code: string) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"connected" | "disconnected" | "loading">("loading")

  useEffect(() => {
    if (!containerRef.current) {
      throw new Error("Code editor container ref is not set")
    }

    const editor = new CodeEditor(code, containerRef.current)
    editor
      .connect()
      .then(() => setStatus("connected"))
      .catch((e) => {
        console.error("Error on editor connection", e)
        setStatus("disconnected")
      })

    return () => {
      editor.destroy()
    }
  }, [code])

  return { containerRef, status }
}
