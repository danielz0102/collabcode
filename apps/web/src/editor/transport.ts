import type { Transport } from "@codemirror/lsp-client"

export function webSocketTransport(uri: string): Promise<Transport> {
  let handlers: ((value: string) => void)[] = []
  const sock = new WebSocket(uri)
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
    sock.onerror = () => reject(new Error(`WebSocket connection to ${uri} failed`))
  })
}
