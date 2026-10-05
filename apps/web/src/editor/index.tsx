"use client"

import { StatusBar } from "./ui/components/status-bar"
import { useCodeEditor } from "./ui/hooks/use-code-editor"

export function CodeEditor({ code }: { code: string }) {
  const { containerRef } = useCodeEditor(code)

  return (
    <div className="flex h-dvh flex-col">
      <div ref={containerRef} className="flex-1" />
      <StatusBar>
        <StatusBar.Lsp status="connected" />
      </StatusBar>
    </div>
  )
}
