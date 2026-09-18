import { WebSocketServer, WebSocket } from "ws"

import { MAX_CONNECTIONS, PORT } from "./config.js"
import { LspServer } from "./lsp.js"

const wss = new WebSocketServer({ port: PORT })
const servers = new Set<LspServer>()

wss.on("connection", (ws) => {
  if (wss.clients.size > MAX_CONNECTIONS) {
    console.warn(`[warn] connection rejected, at capacity (${wss.clients.size})`)
    ws.close(1013, "Server at capacity")
    return
  }

  const lsp = LspServer.create({
    onMessage: (message) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message))
    },
    onError: (err) => {
      console.error(`[fatal] failed to spawn typescript-language-server: ${err.message}`)
      ws.close()
    },
    onExit: () => {
      ws.close()
    },
  })

  ws.on("message", (data) => {
    const rpc = rawDataToString(data)

    try {
      lsp.receive(JSON.parse(rpc)).catch((err) => {
        console.error("[error] failed to write message to LSP server:", err)
      })
    } catch {
      console.error("[error] invalid JSON message received:", rpc)
    }
  })

  servers.add(lsp)
  console.log(`[info] client connected (${wss.clients.size} active)`)

  ws.on("close", () => {
    lsp.dispose()
    servers.delete(lsp)
    console.log(`[info] client disconnected (${wss.clients.size} active)`)
  })
  ws.on("error", () => {
    lsp.dispose()
    servers.delete(lsp)
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
  for (const lsp of servers) lsp.dispose()
  servers.clear()
  wss.close(() => process.exit(0))
}

function rawDataToString(data: WebSocket.RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString()
  if (Buffer.isBuffer(data)) return data.toString()
  return Buffer.from(data).toString()
}
