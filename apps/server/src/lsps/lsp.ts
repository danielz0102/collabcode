import type { ChildProcessByStdio } from "node:child_process"
import { EventEmitter } from "node:events"
import type { Readable, Writable } from "node:stream"

import { Message } from "vscode-jsonrpc"
import { StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc/node"

export type LspChildProcess = ChildProcessByStdio<Writable, Readable, Readable | null>

/**
 * Speaks JSON-RPC with a language server over a child process' stdio.
 *
 * Messages decoded from the server are delivered via `onMessage`; handing the
 * process to an `LspProcess` transfers ownership of its lifecycle — `dispose`
 * kills it.
 */
export class Lsp {
  private readonly reader: StreamMessageReader
  private readonly writer: StreamMessageWriter
  private readonly emitter = new EventEmitter()

  constructor(private readonly process: LspChildProcess) {
    this.reader = new StreamMessageReader(process.stdout)
    this.writer = new StreamMessageWriter(process.stdin)

    process.on("error", (error) => this.emitter.emit("error", error))
    process.on("exit", (code, signal) => this.emitter.emit("exit", code, signal))

    this.reader.onError((error) => this.emitter.emit("error", error))
    this.reader.listen((message) => this.emitter.emit("message", message))
  }

  /** Writes a message to the language server. */
  send(message: Message): void {
    this.writer.write(message).catch((error) => this.emitter.emit("error", error))
  }

  /** Stops reading/writing and kills the underlying process. */
  dispose(): void {
    this.reader.dispose()
    this.writer.dispose()
    this.process.kill()
  }

  /** Registers a listener for messages decoded from the language server.
   * The listener should send a response to the client.
   */
  onMessage(listener: (message: Message) => void): this {
    this.emitter.on("message", listener)
    return this
  }

  /** Registers a listener for process, read, and write errors. */
  onError(listener: (error: Error) => void): this {
    this.emitter.on("error", listener)
    return this
  }

  /** Registers a listener for the language server process exiting. */
  onExit(listener: (code: number | null, signal: NodeJS.Signals | null) => void): this {
    this.emitter.on("exit", listener)
    return this
  }
}
