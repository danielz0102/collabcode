import { ErrorCodes, Message } from "vscode-jsonrpc"
import { WebSocketServer } from "ws"

import { LspProcess } from "../lsps/lsp-process.js"
import { handleTypescriptServerRequest, spawnTypescriptLsp } from "../lsps/typescript-lsp.js"

export function createLspWss() {
  const wss = new WebSocketServer({ noServer: true })

  wss.on("connection", (ws, req) => {
    console.log(`LSP client connected from ${req.socket.remoteAddress}`)

    const lsp = new LspProcess(spawnTypescriptLsp(), {
      onServerRequest: handleTypescriptServerRequest,
    })

    lsp.onError((error) => {
      console.error(error)
      ws.close(1011, "Language server failed")
    })

    lsp.onExit(() => {
      if (ws.readyState === ws.OPEN) {
        ws.close()
      }
    })

    // Language server -> browser. The reader strips the `Content-Length`
    // framing and hands us plain JSON-RPC objects.
    lsp.onMessage((message) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message))
      }
    })

    // Browser -> language server. The writer adds the `Content-Length`
    // framing the stdio server expects.
    ws.on("message", (data) => {
      let message: Message
      try {
        message = JSON.parse(data.toString())
      } catch {
        // The language server never sees unparseable input, so answer here.
        ws.send(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: { code: ErrorCodes.ParseError, message: "Parse error" },
          })
        )
        return
      }

      lsp.send(message)
    })

    ws.on("close", () => {
      lsp.dispose()
    })

    ws.on("error", (error) => {
      console.error(error)
      lsp.dispose()
    })
  })

  return wss
}
