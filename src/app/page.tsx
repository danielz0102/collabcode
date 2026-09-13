import { File } from "../components/file"

const code = `function hello() {
  console.log("Hello, world!")
}`

export default function Home() {
  return (
    <div className="h-dvh">
      <File code={code} />
    </div>
  )
}
