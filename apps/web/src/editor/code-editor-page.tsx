"use client"

import {
  HocuspocusProviderWebsocketComponent,
  HocuspocusRoom,
  useHocuspocusProvider,
} from "@hocuspocus/provider-react"
import Editor, { OnMount } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"

export function CodeEditorPage() {
  return (
    <HocuspocusProviderWebsocketComponent url="ws://localhost:3001">
      <HocuspocusRoom name="code-editor">
        <CodeEditor />
      </HocuspocusRoom>
    </HocuspocusProviderWebsocketComponent>
  )
}

function CodeEditor() {
  const provider = useHocuspocusProvider()

  const handleOnMount: OnMount = (editor) => {
    if (!editor || !provider) return

    const yText = provider.document.getText("monaco")
    const model = editor.getModel()
    if (!model) return

    const binding = new MonacoBinding(yText, model, new Set([editor]), provider.awareness)

    return () => binding.destroy()
  }

  return (
    <div className="relative flex h-dvh flex-col">
      <Editor
        className="flex-1"
        defaultLanguage="typescript"
        theme="vs-dark"
        onMount={handleOnMount}
      />
    </div>
  )
}
