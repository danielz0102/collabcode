import { Document } from "./ui/components/document"

export function CodeEditor({ code }: { code: string }) {
  return (
    <div className="flex h-dvh">
      <Document code={code} className="flex-1" />
    </div>
  )
}
