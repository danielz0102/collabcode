import { type ChildProcess } from "node:child_process"
import { EventEmitter } from "node:events"

import { Message, type RequestMessage } from "vscode-jsonrpc"
import { StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc/node"

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
 * The process is injected rather than spawned here so that the decision of
 * *which* language server to run (and how) stays in the language definitions,
 * and so the transport can be exercised with a fake process in tests.
 *
 * Messages decoded from the server are delivered via `onMessage`; handing the
 * process to an `LspProcess` transfers ownership of its lifecycle — `dispose`
 * kills it.
 */
export class LspProcess {
  readonly #process: ChildProcess
  readonly #reader: StreamMessageReader
  readonly #writer: StreamMessageWriter
  readonly #emitter = new EventEmitter()
  readonly #onServerRequest?: ServerRequestHandler

  constructor(process: ChildProcess, options: LspProcessOptions = {}) {
    const { stdin, stdout } = process

    if (!stdin || !stdout) {
      throw new Error("Language server process must expose stdin and stdout")
    }

    this.#process = process
    this.#onServerRequest = options.onServerRequest
    this.#reader = new StreamMessageReader(stdout)
    this.#writer = new StreamMessageWriter(stdin)

    process.on("error", (error) => this.#emitter.emit("error", error))
    process.on("exit", (code, signal) => this.#emitter.emit("exit", code, signal))

    this.#reader.onError((error) => this.#emitter.emit("error", error))
    this.#reader.listen((message) => this.#receive(message))
  }

  /** Writes a message to the language server, adding the stdio framing. */
  send(message: Message): void {
    this.#writer.write(message).catch((error) => this.#emitter.emit("error", error))
  }

  /** Stops reading/writing and kills the underlying process. */
  dispose(): void {
    this.#reader.dispose()
    this.#writer.dispose()
    this.#process.kill()
  }

  /** Registers a listener for messages decoded from the language server. */
  onMessage(listener: (message: Message) => void): this {
    this.#emitter.on("message", listener)
    return this
  }

  /** Registers a listener for process, read, and write errors. */
  onError(listener: (error: Error) => void): this {
    this.#emitter.on("error", listener)
    return this
  }

  /** Registers a listener for the language server process exiting. */
  onExit(listener: (code: number | null, signal: NodeJS.Signals | null) => void): this {
    this.#emitter.on("exit", listener)
    return this
  }

  #receive(message: Message): void {
    if (Message.isRequest(message) && this.#onServerRequest) {
      const result = this.#onServerRequest(message)

      if (result !== undefined) {
        this.send({ jsonrpc: "2.0", id: message.id, result } as unknown as Message)
        return
      }
    }

    this.#emitter.emit("message", message)
  }
}
