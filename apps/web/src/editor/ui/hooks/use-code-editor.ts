import { useEffect, useRef, useState } from "react"

import { CodeEditor } from "../editor-view"
import type { LspStatus } from "../types"

export function useCodeEditor(code: string) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lspStatus, setLspStatus] = useState<LspStatus>("loading")

  useEffect(() => {
    if (!containerRef.current) {
      throw new Error("Code editor container ref is not set")
    }

    const editor = new CodeEditor(code, containerRef.current)
    editor.connectLsp({
      onConnect() {
        setLspStatus("connected")
      },
      onError() {
        setLspStatus("error")
      },
    })

    return () => {
      setLspStatus("disconnected")
      editor.destroy()
    }
  }, [code])

  return { containerRef, lspStatus }
}
