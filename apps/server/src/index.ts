import { Server } from "@hocuspocus/server"
import * as Y from "yjs"

import { PORT } from "./config.js"

const initialCode = `function helloHocuspocus() {
  console.log("hello")
}`

const server = new Server({
  address: "localhost",
  port: PORT,
  async onLoadDocument() {
    const ydoc = new Y.Doc()
    ydoc.getText("monaco").insert(0, initialCode)
    return ydoc
  },
})

await server.listen()
