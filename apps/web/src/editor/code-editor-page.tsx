"use client"

import { javascript } from "@codemirror/lang-javascript"
import { languageServerExtensions, LSPClient, LSPPlugin } from "@codemirror/lsp-client"
import {
  HocuspocusProviderWebsocketComponent,
  HocuspocusRoom,
  useHocuspocusProvider,
} from "@hocuspocus/provider-react"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import CodeMirror, { type ReactCodeMirrorProps } from "@uiw/react-codemirror"
import { yCollab } from "y-codemirror.next"
import * as Y from "yjs"

import { WS_URL } from "@/config/client"

import { useWebSocket } from "./hooks/use-web-socket"
import { WebSocketTransport } from "./web-socket-transport"

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
  const ws = useWebSocket(`${WS_URL}/lsp`)
  const provider = useHocuspocusProvider()
  const yText = provider.document.getText("code-editor")

  const handleOnCreate: ReactCodeMirrorProps["onCreateEditor"] = (view) => {
    const lsp = LSPPlugin.get(view)

    if (lsp) {
      ws.onOpen((socket) => {
        const transport = new WebSocketTransport(socket)
        lsp.client.connect(transport)
      })
    }
  }

  return (
    <div className="relative flex h-dvh flex-col">
      <CodeMirror
        className="flex-1"
        height="100%"
        extensions={[
          javascript({ typescript: true }),
          yCollab(yText, provider.awareness, { undoManager: new Y.UndoManager(yText) }),
          new LSPClient({ extensions: languageServerExtensions() }).plugin("file://main.ts"),
        ]}
        theme={vscodeDark}
        onCreateEditor={handleOnCreate}
      />
    </div>
  )
}
