"use client"

import { RunButton } from "./components/run-button"
import { StatusBar } from "./components/status-bar"
import { useCodeEditor } from "./editor-view/use-code-editor"

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
