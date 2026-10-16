import type { Transport } from "@codemirror/lsp-client"

type RequestHandler = (json: string) => void

/* Server-to-client requests that need to be handled client-side to avoid errors */
const unsupportedServerRequestHandlers: Record<string, (params?: any) => unknown> = {
  "client/registerCapability": () => null,
  "client/unregisterCapability": () => null,
  "window/workDoneProgress/create": () => null,
  "window/showMessageRequest": () => null,
  "workspace/workspaceFolders": () => null,
  "workspace/configuration": (params?: any) => {
    if (!params || !params.items) {
      return [null]
    }
    return params.items.map(() => null)
  },
}

export class WebSocketTransport implements Transport {
  private handlers: RequestHandler[] = []

  constructor(private socket: WebSocket) {
    this.socket.addEventListener("message", (e) => {
      const data = e.data.toString()
      try {
        const message = JSON.parse(data)
        if (isServerRequest(message)) {
          const handler = unsupportedServerRequestHandlers[message.method]
          if (handler) {
            const result = handler(message.params)
            const response = {
              jsonrpc: "2.0",
              id: message.id,
              result,
            }
            this.socket.send(JSON.stringify(response))
            return
          }
        }
      } catch (err) {
        // If parsing fails, pass through to handlers as-is
        this.handlers.forEach((h) => h(data))
        return
      }
      this.handlers.forEach((h) => h(data))
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

function isServerRequest(message: any): boolean {
  if (!message || message.jsonrpc !== "2.0") return false
  if ("id" in message && "method" in message && !("result" in message) && !("error" in message)) {
    return true
  }
  return false
}
