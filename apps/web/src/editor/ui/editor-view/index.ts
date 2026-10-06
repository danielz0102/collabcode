import { typescriptLanguage } from "@codemirror/lang-javascript"
import { languageServerExtensions, LSPClient } from "@codemirror/lsp-client"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { basicSetup } from "codemirror"

import { createWsTransport } from "./transport"

const fullHeightTheme = EditorView.theme({
  "&": { height: "100%" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": { fontFamily: "var(--font-mono)" },
})

const FILE_URI = "file:///workspace/main.ts"

export class CodeEditor {
  private socket?: WebSocket
  private lspClient: LSPClient
  private view: EditorView

  constructor(code: string, parent: HTMLElement) {
    this.lspClient = new LSPClient({ extensions: languageServerExtensions() })
    this.view = new EditorView({
      doc: code,
      extensions: [
        basicSetup,
        typescriptLanguage,
        this.lspClient.plugin(FILE_URI, "typescript"),
        fullHeightTheme,
        oneDark,
      ],
      parent,
    })
  }

  connectLsp({ onConnect, onError }: { onConnect?: () => void; onError?: () => void }) {
    if (this.lspClient.connected) return

    createWsTransport()
      .then(({ socket, transport }) => {
        this.socket = socket

        socket.addEventListener("error", () => {
          onError?.()
          this.destroy()
        })

        this.lspClient.connect(transport)
        onConnect?.()
      })
      .catch((err) => {
        console.error("Failed to connect to LSP server:", err)
        onError?.()
      })
  }

  destroy() {
    this.lspClient.disconnect()
    this.socket?.close()
    this.view.destroy()
  }
}
