import { Document } from "./components/document"
import { FileTree } from "./components/file-tree"

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
            },
          ],
        }}
      />
      <Document code={code} className="flex-1" />
    </div>
  )
}
