import type { Transport } from "@codemirror/lsp-client"

type RequestHandler = (json: string) => void

export class WebSocketTransport implements Transport {
  private handlers: RequestHandler[] = []

  constructor(private socket: WebSocket) {
    this.socket.addEventListener("message", (e) => {
      this.handlers.forEach((h) => h(e.data.toString()))
    })
  }

  send(message: string): void {
    this.socket.send(message)
  }

  subscribe(handler: RequestHandler): void {
    this.handlers.push(handler)
  }

  unsubscribe(handler: RequestHandler): void {
    this.handlers = this.handlers.filter((h) => h !== handler)
  }
}
