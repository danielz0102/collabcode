import { createServer } from "node:http"

import express from "express"

import { PORT } from "./config.js"
import { initEditorWss } from "./servers/editor-wss.js"

const app = express()
const server = createServer(app)

initEditorWss(server)

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
