import { spawn } from "node:child_process"

import type { LspChildProcess } from "./lsp.js"

export function spawnTypescriptLspProcess(): LspChildProcess {
  const isWindows = process.platform === "win32"
  const tscBin = isWindows ? "node_modules/typescript/bin/tsc" : "node_modules/.bin/tsc"

  return spawn(tscBin, ["--lsp", "--stdio"], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "inherit"],
    shell: isWindows,
  })
}
