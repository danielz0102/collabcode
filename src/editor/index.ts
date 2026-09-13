import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { basicSetup } from "codemirror"

export class Editor {
  private view: EditorView

  constructor(
    public code: string,
    public parent?: HTMLElement
  ) {
    this.view = new EditorView({
      doc: code,
      extensions: [basicSetup, javascript(), oneDark],
      parent: parent ?? document.body,
    })
  }

  destroy() {
    this.view.destroy()
  }
}
