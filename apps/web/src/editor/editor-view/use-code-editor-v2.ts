import * as monaco from "monaco-editor"
import { useEffect, type RefObject } from "react"

export function useCodeEditorV2({
  code,
  containerRef,
}: {
  code: string
  containerRef: RefObject<HTMLDivElement | null>
}) {
  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      throw new Error("Container ref is not set")
    }

    const editor = monaco.editor.create(container, {
      value: code,
      language: "typescript",
    })

    return () => {
      editor.dispose()
    }
  }, [code, containerRef])
}
