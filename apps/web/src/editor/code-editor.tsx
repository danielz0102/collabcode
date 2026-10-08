"use client"

import { OutputPanel } from "./components/output-panel"
import { RunButton } from "./components/run-button"
import { StatusBar } from "./components/status-bar"
import { useCodeEditor } from "./editor-view/use-code-editor"

export function CodeEditor({ code }: { code: string }) {
  const { containerRef, lspStatus, requestResize } = useCodeEditor(code)

  return (
    <div className="relative flex h-dvh flex-col">
      <div className="flex flex-1">
        <main ref={containerRef} className="flex-1" />
        <OutputPanel onResize={requestResize}>5</OutputPanel>
      </div>
      <RunButton />
      <StatusBar>
        <StatusBar.Lsp status={lspStatus} />
      </StatusBar>
    </div>
  )
}
