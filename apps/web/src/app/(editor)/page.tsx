"use client"

import dynamic from "next/dynamic"

const CodeEditorPage = dynamic(
  () => import("@/editor/code-editor-page").then(({ CodeEditorPage }) => CodeEditorPage),
  {
    ssr: false,
  }
)

export default function EditorPage() {
  return <CodeEditorPage />
}
