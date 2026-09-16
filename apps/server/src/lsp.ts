import { spawn } from "node:child_process"

import { StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc/node"
import { WebSocket } from "ws"

function rawDataToString(data: WebSocket.RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString()
  if (Buffer.isBuffer(data)) return data.toString()
  return Buffer.from(data).toString()
}

export function createLspBridge(ws: WebSocket) {
  const child = spawn("typescript-language-server", ["--stdio"], {
    stdio: ["pipe", "pipe", "pipe"],
  })

  const reader = new StreamMessageReader(child.stdout)
  const writer = new StreamMessageWriter(child.stdin)

  reader.listen((message) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message))
  })

  ws.on("message", (data) => {
    void writer.write(JSON.parse(rawDataToString(data)))
  })

  child.stderr.on("data", (chunk) => console.error(`[lsp] ${chunk.toString()}`))
  child.on("exit", () => ws.close())

  return {
    dispose() {
      child.kill()
    },
  }
}
