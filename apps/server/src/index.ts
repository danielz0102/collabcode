import { createServer } from "node:http"

import express from "express"

import { PORT } from "./config.js"
import { createEditorWss } from "./servers/editor-wss.js"
import { createLspWss } from "./servers/lsp-manager-wss.js"

const app = express()
const server = createServer(app)

const editorWss = createEditorWss()
const lspWss = createLspWss()

server.on("upgrade", (req, socket, head) => {
  if (!req.url) {
    throw new Error("Request is not valid", { cause: req })
  }

  if (req.url.startsWith("/editor")) {
    editorWss.handleUpgrade(req, socket, head, (ws) => {
      editorWss.emit("connection", ws, req)
    })
  } else if (req.url.startsWith("/lsp")) {
    lspWss.handleUpgrade(req, socket, head, (ws) => {
      lspWss.emit("connection", ws, req)
    })
  } else {
    socket.destroy()
  }
})

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
