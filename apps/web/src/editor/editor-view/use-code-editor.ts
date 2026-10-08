import { useEffect, useRef, useState } from "react"

import { LSP_WS_URL } from "@/config/client"

import type { LspStatus } from "../types"
import { CodeEditor } from "./code-editor"
import { WebSocketTransport } from "./web-socket-transport"

export function useCodeEditor(code: string) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<CodeEditor | null>(null)
  const [lspStatus, setLspStatus] = useState<LspStatus>("loading")

  useEffect(() => {
    if (!containerRef.current) {
      throw new Error("Code editor container ref is not set")
    }

    const editor = new CodeEditor(code, containerRef.current)
    editorRef.current = editor
    const controller = new AbortController()

    WebSocketTransport.create(LSP_WS_URL, { signal: controller.signal })
      .then((result) => {
        if (!result.ok) {
          if (result.error === "aborted") {
            setLspStatus("disconnected")
          }
          return
        }

        const transport = result.data

        transport.onClose(() => setLspStatus("disconnected"))
        transport.onError(() => setLspStatus("error"))

        editor.connectLsp(transport)
        setLspStatus("connected")
      })
      .catch(() => setLspStatus("error"))

    return () => {
      controller.abort()
      setLspStatus("disconnected")
      editor.destroy()
      editorRef.current = null
    }
  }, [code])

  const requestResize = () => {
    editorRef.current?.requestMeasure()
  }

  return { containerRef, lspStatus, requestResize }
}
