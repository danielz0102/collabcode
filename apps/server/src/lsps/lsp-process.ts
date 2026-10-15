import type { ChildProcessByStdio } from "node:child_process"
import { EventEmitter } from "node:events"
import type { Readable, Writable } from "node:stream"

import { Message, type RequestMessage } from "vscode-jsonrpc"
import { StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc/node"

export type LspChildProcess = ChildProcessByStdio<Writable, Readable, Readable | null>

/**
 * Called for every request the language server sends to the client.
 *
 * Return a value to answer the request locally — the client never sees it.
 * Return `undefined` to let the request fall through to the client.
 */
export type ServerRequestHandler = (message: RequestMessage) => unknown

export type LspProcessOptions = {
  onServerRequest?: ServerRequestHandler
}

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
  //TODO: Rethink `onServerRequest`. LSP process shouldn't know what requests the client can handle.
  private readonly onServerRequest?: ServerRequestHandler

  constructor(
    private readonly process: LspChildProcess,
    options: LspProcessOptions = {}
  ) {
    this.onServerRequest = options.onServerRequest
    this.reader = new StreamMessageReader(process.stdout)
    this.writer = new StreamMessageWriter(process.stdin)

    process.on("error", (error) => this.emitter.emit("error", error))
    process.on("exit", (code, signal) => this.emitter.emit("exit", code, signal))

    this.reader.onError((error) => this.emitter.emit("error", error))
    this.reader.listen((message) => this.receive(message))
  }

  /** Writes a message to the language server, adding the stdio framing. */
  send(message: Message): void {
    this.writer.write(message).catch((error) => this.emitter.emit("error", error))
  }

  /** Stops reading/writing and kills the underlying process. */
  dispose(): void {
    this.reader.dispose()
    this.writer.dispose()
    this.process.kill()
  }

  /** Registers a listener for messages decoded from the language server. */
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

  private receive(message: Message): void {
    if (Message.isRequest(message) && this.onServerRequest) {
      const result = this.onServerRequest(message)

      if (result !== undefined) {
        this.send({ jsonrpc: "2.0", id: message.id, result } as unknown as Message)
        return
      }
    }

    this.emitter.emit("message", message)
  }
}
