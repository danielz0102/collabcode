"use client"

import { javascript } from "@codemirror/lang-javascript"
import {
  HocuspocusProviderWebsocketComponent,
  HocuspocusRoom,
  useHocuspocusProvider,
} from "@hocuspocus/provider-react"
import { languageServer } from "@marimo-team/codemirror-languageserver"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import CodeMirror from "@uiw/react-codemirror"
import { yCollab } from "y-codemirror.next"
import * as Y from "yjs"

import { WS_URL } from "@/config/client"

export function CodeEditorPage() {
  return (
    <HocuspocusProviderWebsocketComponent url={`${WS_URL}/editor`}>
      <HocuspocusRoom name="code-editor">
        <CodeEditor />
      </HocuspocusRoom>
    </HocuspocusProviderWebsocketComponent>
  )
}

function CodeEditor() {
  const provider = useHocuspocusProvider()
  const yText = provider.document.getText("code-editor")

  return (
    <div className="relative flex h-dvh flex-col">
      <CodeMirror
        className="flex-1"
        height="100%"
        extensions={[
          javascript({ typescript: true }),
          yCollab(yText, provider.awareness, { undoManager: new Y.UndoManager(yText) }),
          languageServer({
            serverUri: `${WS_URL}/lsp` as `ws://${string}` | `wss://${string}`,
            rootUri: "file:///",
            workspaceFolders: null,
            documentUri: "file:///main.ts",
            languageId: "typescript",
            allowHTMLContent: true,
          }),
        ]}
        theme={vscodeDark}
      />
    </div>
  )
}
