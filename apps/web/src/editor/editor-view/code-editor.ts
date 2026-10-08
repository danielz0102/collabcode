import { typescriptLanguage } from "@codemirror/lang-javascript"
import { languageServerExtensions, LSPClient, type Transport } from "@codemirror/lsp-client"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { basicSetup } from "codemirror"

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
        EditorView.lineWrapping,
      ],
      parent,
    })
  }

  connectLsp(transport: Transport) {
    if (!this.lspClient.connected) {
      this.lspClient.connect(transport)
    }
  }

  requestMeasure() {
    this.view.requestMeasure()
  }

  destroy() {
    this.lspClient.disconnect()
    this.view.destroy()
  }
}
