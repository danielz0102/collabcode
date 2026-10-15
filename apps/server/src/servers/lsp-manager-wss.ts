import { spawn } from "node:child_process"

import { ErrorCodes, Message } from "vscode-jsonrpc"
import { StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc/node"
import { WebSocketServer } from "ws"

const isWindows = process.platform === "win32"

// Server-to-client requests that `@codemirror/lsp-client` does not implement.
// The client answers *every* server request with `MethodNotFound` (see its
// `receiveMessage`), which makes servers complain via `window/logMessage`
// (tsc, for example, tries to register a config-file watcher on `initialized`).
// We settle those requests here, on the client's behalf.
const serverRequestHandlers: Record<string, (params: any) => unknown> = {
  "client/registerCapability": () => null,
  "client/unregisterCapability": () => null,
  "window/workDoneProgress/create": () => null,
  "window/showMessageRequest": () => null,
  "workspace/workspaceFolders": () => null,
  "workspace/configuration": (params) => (params?.items ?? []).map(() => null),
}

function spawnTypescriptLsp() {
  return spawn(
    isWindows ? "node_modules/typescript/bin/tsc" : "node_modules/.bin/tsc",
    ["--lsp", "--stdio"],
    {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "inherit"],
      shell: isWindows,
    }
  )
}

export function createLspWss() {
  const wss = new WebSocketServer({ noServer: true })

  wss.on("connection", (ws, req) => {
    console.log(`[lsp] client connected from ${req.socket.remoteAddress}`)

    const server = spawnTypescriptLsp()

    server.on("error", (error) => {
      console.error("[lsp] failed to start language server", error)
      ws.close(1011, "Language server failed to start")
    })

    server.on("exit", (code, signal) => {
      console.log(`[lsp] language server exited (code=${code} signal=${signal})`)
      if (ws.readyState === ws.OPEN) {
        ws.close()
      }
    })

    const writer = new StreamMessageWriter(server.stdin)
    const reader = new StreamMessageReader(server.stdout)

    const writeToServer = (message: Message) => {
      writer.write(message).catch((error) => {
        console.error("[lsp] failed to write to language server", error)
      })
    }

    // Language server -> browser. The reader strips the `Content-Length`
    // framing and hands us plain JSON-RPC objects.
    reader.listen((message) => {
      if (Message.isRequest(message)) {
        const handle = serverRequestHandlers[message.method]
        if (handle) {
          console.log(`[lsp] handling server request '${message.method}'`)
          writeToServer({
            jsonrpc: "2.0",
            id: message.id,
            result: handle(message.params),
          } as unknown as Message)
          return
        }
      }

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

      writeToServer(message)
    })

    ws.on("close", (code, reason) => {
      console.log(`[lsp] client disconnected (${code} ${reason.toString()})`)
      server.kill()
    })

    ws.on("error", (error) => {
      console.error("[lsp] socket error", error)
      server.kill()
    })
  })

  return wss
}
