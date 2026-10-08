"use client"

import { RunButton } from "./ui/components/run-button"
import { StatusBar } from "./ui/components/status-bar"
import { useCodeEditor } from "./ui/editor-view"

export function CodeEditor({ code }: { code: string }) {
  const { containerRef, lspStatus } = useCodeEditor(code)

  return (
    <div className="relative flex h-dvh flex-col">
      <div ref={containerRef} className="flex-1" />
      <RunButton />
      <StatusBar>
        <StatusBar.Lsp status={lspStatus} />
      </StatusBar>
    </div>
  )
}
