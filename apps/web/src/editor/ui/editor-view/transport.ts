import type { Transport } from "@codemirror/lsp-client"

import { LSP_WS_URL } from "@/config/client"

type LspHandler = (message: string) => void

export function createWsTransport(): Promise<Transport> {
  const { promise, resolve, reject } = Promise.withResolvers<Transport>()

  let handlers: LspHandler[] = []
  const sock = new WebSocket(LSP_WS_URL)

  sock.onmessage = (e: MessageEvent<string>) => {
    handlers.forEach((h) => h(e.data))
  }

  sock.onopen = () => {
    const transport: Transport = {
      send(message) {
        sock.send(message)
      },
      subscribe(handler) {
        handlers.push(handler)
      },
      unsubscribe(handler) {
        handlers = handlers.filter((h) => h !== handler)
      },
    }

    resolve(transport)
  }

  sock.onerror = () => reject(new Error(`WebSocket connection to ${LSP_WS_URL} failed`))

  return promise
}
