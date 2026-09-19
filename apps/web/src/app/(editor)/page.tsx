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
      <FileTree />
      <Document code={code} className="flex-1" />
    </div>
  )
}
