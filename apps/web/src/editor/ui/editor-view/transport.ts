import type { Transport } from "@codemirror/lsp-client"

import { LSP_WS_URL } from "@/config/client"

export function createWsTransport(): Promise<Transport> {
  let handlers: ((value: string) => void)[] = []
  const sock = new WebSocket(LSP_WS_URL)
  sock.onmessage = (e) => {
    for (const h of handlers) h(e.data.toString())
  }
  const { promise, resolve, reject } = Promise.withResolvers<Transport>()

  sock.onopen = () =>
    resolve({
      send(message) {
        sock.send(message)
      },
      subscribe(handler) {
        handlers.push(handler)
      },
      unsubscribe(handler) {
        handlers = handlers.filter((h) => h !== handler)
      },
    })
  sock.onerror = () => reject(new Error(`WebSocket connection to ${LSP_WS_URL} failed`))

  return promise
}
