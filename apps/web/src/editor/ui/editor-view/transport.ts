import type { Transport } from "@codemirror/lsp-client"

import { LSP_WS_URL } from "@/config/client"

type LspHandler = (message: string) => void

export async function createWsTransport(): Promise<{ transport: Transport; socket: WebSocket }> {
  const socket = new WebSocket(LSP_WS_URL)
  let handlers: LspHandler[] = []

  socket.addEventListener("message", (e) => handlers.forEach((h) => h(e.data)))

  const transport: Transport = {
    send(message) {
      socket.send(message)
    },
    subscribe(handler) {
      handlers.push(handler)
    },
    unsubscribe(handler) {
      handlers = handlers.filter((h) => h !== handler)
    },
  }

  const { promise, reject, resolve } = Promise.withResolvers<{
    transport: Transport
    socket: WebSocket
  }>()

  socket.addEventListener("open", () => resolve({ transport, socket }))
  socket.addEventListener("error", () => reject())

  return promise
}
