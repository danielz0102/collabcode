import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { basicSetup } from "codemirror"

const fullHeightTheme = EditorView.theme({
  "&": { height: "100%" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": { fontFamily: "var(--font-mono)" },
})

export class Editor {
  private view: EditorView

  constructor(
    public code: string,
    public parent?: HTMLElement
  ) {
    this.view = new EditorView({
      doc: code,
      extensions: [basicSetup, javascript(), fullHeightTheme, oneDark],
      parent: parent ?? document.body,
    })
  }

  destroy() {
    this.view.destroy()
  }
}
