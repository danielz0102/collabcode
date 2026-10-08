import { CodeEditor } from "@/editor/code-editor"

const code = `interface User {
  name: string
  age: number
}

const user: User = { name: "Alice", age: 30 }

// Place the cursor after "user." to see property completions
user.
`

export default function EditorPage() {
  return <CodeEditor code={code} />
}
