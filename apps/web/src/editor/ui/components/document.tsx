"use client"

import { useCodeEditor } from "../hooks/use-code-editor"

export function Document({ code, className }: { code: string; className?: string }) {
  const { containerRef } = useCodeEditor(code)
  return <div ref={containerRef} className={className} />
}
