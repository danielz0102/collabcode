import type { Transport } from "@codemirror/lsp-client"

export class WebSocketTransport implements Transport {
  private readonly handlers = new Set<(data: string) => void>()

  private constructor(private readonly socket: WebSocket) {
    this.socket.addEventListener("message", (e) => this.handlers.forEach((h) => h(e.data)))
  }

  static async create(url: string): Promise<WebSocketTransport> {
    const { promise, reject, resolve } = Promise.withResolvers<WebSocketTransport>()
    const socket = new WebSocket(url)

    socket.addEventListener("open", () => {
      resolve(new WebSocketTransport(socket))
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
