import { Document } from "./ui/components/document"
import { StatusBar } from "./ui/components/status-bar"

export function CodeEditor({ code }: { code: string }) {
  return (
    <div className="flex h-dvh flex-col">
      <Document code={code} className="flex-1" />
      <StatusBar>
        <StatusBar.Lsp status="loading" />
      </StatusBar>
    </div>
  )
}
