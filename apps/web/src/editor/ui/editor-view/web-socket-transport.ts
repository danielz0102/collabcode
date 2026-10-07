import type { Transport } from "@codemirror/lsp-client"

import { Result } from "@/shared/result"

type WsTransportError = "aborted"

export class WebSocketTransport implements Transport {
  private readonly handlers = new Set<(data: string) => void>()

  private constructor(private readonly socket: WebSocket) {
    this.socket.addEventListener("message", (e) => this.handlers.forEach((h) => h(e.data)))
  }

  static async create(
    url: string,
    opts: { signal?: AbortSignal } = {}
  ): Promise<Result<WebSocketTransport, WsTransportError>> {
    const { signal } = opts
    const { promise, reject, resolve } =
      Promise.withResolvers<Result<WebSocketTransport, WsTransportError>>()

    signal?.addEventListener(
      "abort",
      () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close()
        }
        resolve(Result.fail("aborted"))
      },
      { once: true }
    )

    const socket = new WebSocket(url)

    socket.addEventListener("open", () => {
      if (signal?.aborted) {
        socket.close()
        resolve(Result.fail("aborted"))
        return
      }

      resolve(Result.ok(new WebSocketTransport(socket)))
    })

    socket.addEventListener("error", () => {
      reject(new Error("Failed to create WebSocket"))
    })

    return promise
  }

  send(message: string): void {
    this.socket.send(message)
  }

  subscribe(handler: (value: string) => void): void {
    this.handlers.add(handler)
  }

  unsubscribe(handler: (value: string) => void): void {
    this.handlers.delete(handler)
  }

  close() {
    this.socket.close()
  }

  onClose(cb: () => void) {
    this.socket.addEventListener("close", cb)
  }

  onError(cb: () => void) {
    this.socket.addEventListener("error", cb)
  }
}
