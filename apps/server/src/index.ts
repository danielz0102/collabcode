import { WebSocketServer } from "ws"

import { createLspBridge } from "./lsp.js"

const port = Number(process.env.PORT ?? 3001)
const wss = new WebSocketServer({ port })

wss.on("connection", (ws) => {
  const bridge = createLspBridge(ws)
  ws.on("close", () => bridge.dispose())
  ws.on("error", () => bridge.dispose())
})

console.log(`LSP bridge listening on ws://localhost:${port}`)
