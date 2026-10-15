import { ErrorCodes, Message } from "vscode-jsonrpc"
import { WebSocketServer, type RawData } from "ws"

import { Lsp } from "../lsps/lsp.js"
import { handleTypescriptServerRequest, spawnTypescriptLspProcess } from "../lsps/typescript-lsp.js"

export function createLspWss() {
  const wss = new WebSocketServer({ noServer: true })

  wss.on("connection", (ws, req) => {
    console.log(`LSP client connected from ${req.socket.remoteAddress}`)

    const lsp = new Lsp(spawnTypescriptLspProcess(), {
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

    lsp.onMessage((message) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message))
      }
    })

    ws.on("message", (data) => {
      let message: Message
      try {
        message = JSON.parse(toText(data))
      } catch {
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

function toText(data: RawData): string {
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString()
  }

  if (Array.isArray(data)) {
    return Buffer.concat(data).toString()
  }

  return data.toString()
}
