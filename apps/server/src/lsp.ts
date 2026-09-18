import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process"
import { createRequire } from "node:module"

import { StreamMessageReader, StreamMessageWriter, type Message } from "vscode-jsonrpc/node"

const require = createRequire(import.meta.url)
const languageServerCliPath = require.resolve("typescript-language-server/lib/cli.mjs")

type LspServerOptions = {
  onMessage: (message: Message) => void
  onError?: (err: Error) => void
  onExit?: () => void
}

export class LspServer {
  private constructor(
    private readonly child: ChildProcessWithoutNullStreams,
    private readonly writer: StreamMessageWriter
  ) {}

  static create({ onMessage, onError, onExit }: LspServerOptions): LspServer {
    const child = spawn(process.execPath, [languageServerCliPath, "--stdio"])
    const reader = new StreamMessageReader(child.stdout)
    const writer = new StreamMessageWriter(child.stdin)

    if (onError) {
      child.on("error", onError)
    }

    if (onExit) {
      child.on("exit", onExit)
    }

    reader.listen(onMessage)

    return new LspServer(child, writer)
  }

  async receive(message: Message): Promise<void> {
    if (!this.isRunning) {
      return
    }

    await this.writer.write(message)
  }

  private get isRunning(): boolean {
    return this.child.exitCode === null && this.child.signalCode === null
  }

  dispose(): void {
    if (!this.isRunning) {
      return
    }

    this.child.kill("SIGTERM")

    setTimeout(() => {
      if (this.isRunning) {
        this.child.kill("SIGKILL")
      }
    }, 5000).unref()
  }
}
