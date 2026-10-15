import { spawn } from "node:child_process"

import type { LspChildProcess, ServerRequestHandler } from "./lsp-process.js"

export function spawnTypescriptLsp(): LspChildProcess {
  const isWindows = process.platform === "win32"
  const tscBin = isWindows ? "node_modules/typescript/bin/tsc" : "node_modules/.bin/tsc"

  return spawn(tscBin, ["--lsp", "--stdio"], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "inherit"],
    shell: isWindows,
  })
}

/* Server-to-client requests that `@codemirror/lsp-client` does not implement.
 * The client answers *every* server request with `MethodNotFound`, which makes
 * servers complain via `window/logMessage`.
 * We settle those requests here, on the client's behalf.
 */
const serverRequestHandlers: Record<string, (params: any) => unknown> = {
  "client/registerCapability": () => null,
  "client/unregisterCapability": () => null,
  "window/workDoneProgress/create": () => null,
  "window/showMessageRequest": () => null,
  "workspace/workspaceFolders": () => null,
  "workspace/configuration": (params) => (params?.items ?? []).map(() => null),
}

/**
 * Answers the server requests the browser client can't, so the server doesn't
 * log errors. Returning `undefined` (for unknown methods) lets the request fall
 * through to the client.
 */
export const handleTypescriptServerRequest: ServerRequestHandler = (message) => {
  const handler = serverRequestHandlers[message.method]

  if (!handler) {
    return undefined
  }

  console.log(`[lsp] handling server request '${message.method}'`)
  return handler(message.params)
}
