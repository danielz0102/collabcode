import { WebSocketServer } from "ws"

import { MAX_CONNECTIONS, PORT } from "./config.js"
import { createLspBridge, type LspBridge } from "./lsp.js"

const wss = new WebSocketServer({ port: PORT })
const bridges = new Set<LspBridge>()

wss.on("connection", (ws) => {
  if (wss.clients.size > MAX_CONNECTIONS) {
    console.warn(`[info] connection rejected, at capacity (${wss.clients.size})`)
    ws.close(1013, "Server at capacity")
    return
  }

  const bridge = createLspBridge(ws)
  bridges.add(bridge)
  console.log(`[info] client connected (${wss.clients.size} active)`)

  ws.on("close", () => {
    bridge.dispose()
    bridges.delete(bridge)
    console.log(`[info] client disconnected (${wss.clients.size} active)`)
  })
  ws.on("error", () => {
    bridge.dispose()
    bridges.delete(bridge)
  })
})

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
process.on("uncaughtException", (err) => {
  console.error("[fatal] uncaught exception:", err)
  process.exit(1)
})

console.log(
  `[info] LSP bridge listening on ws://localhost:${PORT} (max ${MAX_CONNECTIONS} connections)`
)

function shutdown() {
  console.log(`[info] shutting down`)
  for (const client of wss.clients) client.close()
  for (const bridge of bridges) bridge.dispose()
  bridges.clear()
  wss.close(() => process.exit(0))
}
