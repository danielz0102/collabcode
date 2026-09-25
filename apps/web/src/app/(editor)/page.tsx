import { FilePlusCorner } from "lucide-react"

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

const nodes: Nodes = new Map([
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
  return (
    <div className="flex h-dvh">
      <Sidebar>
        <div className="flex p-2">
          <button className="cursor-pointer" aria-label="Add new file">
            <FilePlusCorner size={16} />
          </button>
        </div>
        {/* <FileTree root={root} /> */}
        <FileTree nodes={nodes} rootId="/root" />
      </Sidebar>
      <Document code={code} className="flex-1" />
    </div>
  )
}
