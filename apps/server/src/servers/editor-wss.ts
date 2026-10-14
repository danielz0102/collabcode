import type { IncomingMessage } from "node:http"

import { Logger } from "@hocuspocus/extension-logger"
import { Hocuspocus } from "@hocuspocus/server"
import { WebSocketServer, type RawData } from "ws"

const dummyCode = `function main() {
  console.log("Hello Hocuspocus!")
}`

export function createEditorWss() {
  const wss = new WebSocketServer({ noServer: true })
  const hocuspocus = new Hocuspocus({
    extensions: [new Logger()],
    async onLoadDocument({ document }) {
      const yText = document.getText("code-editor")

      if (yText.length === 0) {
        yText.insert(0, dummyCode)
      }

      return document
    },
  })

  wss.on("connection", (ws, request) => {
    const clientConnection = hocuspocus.handleConnection(ws, toWebRequest(request))

    ws.on("message", (message) => {
      clientConnection.handleMessage(toUint8Array(message))
    })

    ws.on("close", (code, reason) => {
      clientConnection.handleClose({ code, reason: reason.toString() })
    })

    ws.on("error", (error) => {
      console.error(error)
    })
  })

  return wss
}

function toWebRequest(request: IncomingMessage): Request {
  const url = `http://${request.headers.host ?? "localhost"}${request.url ?? "/"}`
  const headers = new Headers()

  for (const [key, value] of Object.entries(request.headers)) {
    if (value === undefined) {
      continue
    }

    headers.set(key, Array.isArray(value) ? value.join(", ") : value)
  }

  return new Request(url, { headers })
}

function toUint8Array(data: RawData): Uint8Array {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data)
  }

  if (Array.isArray(data)) {
    return Buffer.concat(data)
  }

  return data
}
