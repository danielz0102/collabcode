import { spawn } from "node:child_process"
import { createRequire } from "node:module"

import { StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc/node"
import { WebSocket } from "ws"

const require = createRequire(import.meta.url)
const languageServerCliPath = require.resolve("typescript-language-server/lib/cli.mjs")

export interface LspBridge {
  dispose(): void
}

export function createLspBridge(ws: WebSocket): LspBridge {
  const child = spawn(process.execPath, [languageServerCliPath, "--stdio"])
  let available = true

  const reader = new StreamMessageReader(child.stdout)
  const writer = new StreamMessageWriter(child.stdin)

  child.on("error", (err) => {
    console.error(`[lsp] failed to spawn typescript-language-server: ${err.message}`)
    available = false
    ws.close()
  })

  reader.listen((message) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message))
  })

  ws.on("message", (data) => {
    if (!available) return

    const rpc = rawDataToString(data)

    try {
      void writer.write(JSON.parse(rpc)).catch((err) => {
        console.error("[error] failed to write message to LSP server:", err)
      })
    } catch {
      console.error("[error] invalid JSON message received:", rpc)
    }
  })

  child.stderr.on("data", (chunk) => console.error(`[lsp] ${chunk.toString()}`))
  child.on("exit", (code, signal) => {
    available = false
    if (code !== 0) console.warn(`[lsp] child exited (code=${code}, signal=${signal})`)
    ws.close()
  })

  let disposed = false

  function dispose(): void {
    if (disposed) return
    disposed = true
    available = false

    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGTERM")
      const timer = setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill("SIGKILL")
        }
      }, 5_000)
      timer.unref()
    }
  }

  return { dispose }
}

function rawDataToString(data: WebSocket.RawData): string {
  if (Array.isArray(data)) return Buffer.concat(data).toString()
  if (Buffer.isBuffer(data)) return data.toString()
  return Buffer.from(data).toString()
}
