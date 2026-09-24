import { FilePlusCorner } from "lucide-react"

import { Document } from "./components/document"
import { FileTree } from "./components/file-tree"
import { Sidebar } from "./components/sidebar"

const code = `interface User {
  name: string
  age: number
}

const user: User = { name: "Alice", age: 30 }

// Place the cursor after "user." to see property completions
user.
`

export default function Editor() {
  return (
    <div className="flex h-dvh">
      <Sidebar>
        <div className="flex p-2">
          <button className="cursor-pointer" aria-label="Add new file">
            <FilePlusCorner size={16} />
          </button>
        </div>
        <FileTree
          root={{
            type: "folder",
            name: "my-folder",
            path: "/my-folder",
            children: [
              {
                type: "folder",
                name: "nested-folder",
                path: "/my-folder/nested-folder",
                children: [
                  {
                    type: "folder",
                    name: "deeply-nested-folder",
                    path: "/my-folder/nested-folder/deeply-nested-folder",
                    children: [
                      {
                        type: "file",
                        name: "deeply-nested-file.ts",
                        path: "/my-folder/nested-folder/deeply-nested-folder/deeply-nested-file.ts",
                      },
                    ],
                  },
                  {
                    type: "file",
                    name: "nested.ts",
                    path: "/my-folder/nested-folder/nested.ts",
                  },
                ],
              },
              {
                type: "file",
                name: "main.ts",
                path: "/my-folder/main.ts",
                selected: true,
              },
            ],
          }}
        />
      </Sidebar>
      <Document code={code} className="flex-1" />
    </div>
  )
}
