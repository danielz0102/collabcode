import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

import { Lsp, type LspChildProcess } from "./lsp.js"

export class TypeScriptLsp extends Lsp {
  protected spawnProcess(): LspChildProcess {
    const cli = fileURLToPath(import.meta.resolve("typescript-language-server/lib/cli.mjs"))

    return spawn(process.execPath, [cli, "--stdio"], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "inherit"],
    })
  }
}
