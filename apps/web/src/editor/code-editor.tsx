"use client"

import Editor from "@monaco-editor/react"

export function CodeEditor({ code }: { code: string }) {
  return (
    <div className="relative flex h-dvh flex-col">
      <Editor className="flex-1" defaultLanguage="typescript" defaultValue={code} theme="vs-dark" />
    </div>
  )
}
