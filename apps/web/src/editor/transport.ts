import type { Transport } from "@codemirror/lsp-client"

import { LSP_WS_URL } from "@/config/client"

export function createWsTransport(): Promise<Transport> {
  let handlers: ((value: string) => void)[] = []
  const sock = new WebSocket(LSP_WS_URL)
  sock.onmessage = (e) => {
    for (const h of handlers) h(e.data.toString())
  }
  return new Promise((resolve, reject) => {
    sock.onopen = () =>
      resolve({
        send(message: string) {
          sock.send(message)
        },
        subscribe(handler: (value: string) => void) {
          handlers.push(handler)
        },
        unsubscribe(handler: (value: string) => void) {
          handlers = handlers.filter((h) => h !== handler)
        },
      })
    sock.onerror = () => reject(new Error(`WebSocket connection to ${LSP_WS_URL} failed`))
  })
}
