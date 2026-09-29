"use client"

import { FilePlusCorner } from "lucide-react"
import { useState } from "react"

import { Document } from "@/editor"
import type { Nodes } from "@/file-tree"
import { FileTree } from "@/file-tree"

import { Sidebar } from "./components/sidebar"

const code = `interface User {
  name: string
  age: number
}

const user: User = { name: "Alice", age: 30 }

// Place the cursor after "user." to see property completions
user.
`

const initialNodes: Nodes = new Map([
  ["/root", { name: "root", children: ["/root/nested-folder", "/root/main.ts"] }],
  ["/root/main.ts", { name: "main.ts" }],
  [
    "/root/nested-folder",
    {
      name: "nested-folder",
      children: ["/root/nested-folder/deeply-nested-folder", "/root/nested-folder/nested.ts"],
    },
  ],
  ["/root/nested-folder/nested.ts", { name: "nested.ts" }],
  [
    "/root/nested-folder/deeply-nested-folder",
    {
      name: "deeply-nested-folder",
      children: ["/root/nested-folder/deeply-nested-folder/deeply-nested-file.ts"],
    },
  ],
  [
    "/root/nested-folder/deeply-nested-folder/deeply-nested-file.ts",
    { name: "deeply-nested-file.ts" },
  ],
])

export default function Editor() {
  const [nodes, setNodes] = useState<Nodes>(() => new Map(initialNodes))
  const [createInputDisplay, setCreateInputDisplay] = useState(false)

  const handleCreate = (name: string, folderId: string) => {
    const newId = `${folderId}/${name}`
    setNodes((prev) => {
      const next = new Map(prev)
      const folder = next.get(folderId)!
      next.set(folderId, { ...folder, children: [newId, ...(folder.children ?? [])] })
      next.set(newId, { name })
      return next
    })
    setCreateInputDisplay(false)
  }

  const handleCancelCreate = () => setCreateInputDisplay(false)

  return (
    <div className="flex h-dvh">
      <Sidebar>
        <div className="flex p-2">
          <button
            type="button"
            className="cursor-pointer"
            aria-label="Add new file"
            // Keep focus where it is so clicking while the create input is open
            // does not blur it — re-clicking the button is a true no-op.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setCreateInputDisplay(true)}
          >
            <FilePlusCorner size={16} />
          </button>
        </div>
        <FileTree
          nodes={nodes}
          rootId="/root"
          selectedId="/root/main.ts"
          className="h-full"
          createInput={{
            display: createInputDisplay,
            onCreate: handleCreate,
            onCancel: handleCancelCreate,
          }}
        />
      </Sidebar>
      <Document code={code} className="flex-1" />
    </div>
  )
}
