import { typescriptLanguage } from "@codemirror/lang-javascript"
import { LSPClient, languageServerExtensions } from "@codemirror/lsp-client"
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

  async connect() {
    if (this.lspClient.connected) return

    const transport = await createWsTransport()
    this.lspClient.connect(transport)
    await this.lspClient.initializing
  }

  destroy() {
    this.lspClient.disconnect()
    this.view.destroy()
  }
}
