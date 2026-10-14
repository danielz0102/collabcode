import { spawn } from "node:child_process"

const server = spawn(
  process.platform === "win32" ? "node_modules/typescript/bin/tsc" : "node_modules/.bin/tsc",
  ["--lsp", "--stdio"],
  {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "inherit"],
    shell: process.platform === "win32",
  }
)

server.on("error", console.error)
server.on("exit", (code) => {
  console.log("LSP exited:", code)
})

const message = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    processId: process.pid,
    rootUri: new URL(`file://${process.cwd()}/`).href,
    capabilities: {},
  },
}

function sendLspMessage(message: any) {
  const body = JSON.stringify(message)

  server.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`)
}

sendLspMessage(message)
