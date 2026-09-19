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

export class Editor {
  private view: EditorView

  private constructor(code: string, parent: HTMLElement, lspClient: LSPClient) {
    this.view = new EditorView({
      doc: code,
      extensions: [
        basicSetup,
        typescriptLanguage,
        lspClient.plugin(FILE_URI, "typescript"),
        fullHeightTheme,
        oneDark,
      ],
      parent,
    })
  }

  static async create(code: string, parent: HTMLElement): Promise<Editor> {
    const transport = await createWsTransport()
    const client = new LSPClient({
      extensions: languageServerExtensions(),
    }).connect(transport)
    return new Editor(code, parent, client)
  }

  destroy() {
    this.view.destroy()
  }
}
