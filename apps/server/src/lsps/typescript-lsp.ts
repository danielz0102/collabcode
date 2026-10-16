import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

import type { LspChildProcess } from "./lsp.js"

export function spawnTypescriptLspProcess(): LspChildProcess {
  const cli = fileURLToPath(import.meta.resolve("typescript-language-server/lib/cli.mjs"))

  return spawn(process.execPath, [cli, "--stdio"], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "inherit"],
  })
}
