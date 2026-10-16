import { Message, RequestMessage } from "vscode-jsonrpc"

/* Server-to-client requests that `@codemirror/lsp-client` does not implement,
 * along with default responses.
 * The client answers *every* server request with `MethodNotFound`, which makes
 * servers complain via `window/logMessage`.
 */
const unsupportedServerRequestHandlers = {
  "client/registerCapability": () => null,
  "client/unregisterCapability": () => null,
  "window/workDoneProgress/create": () => null,
  "window/showMessageRequest": () => null,
  "workspace/workspaceFolders": () => null,
  "workspace/configuration": (params?: any) => {
    if (!params || !params.items) {
      return [null]
    }

    return params.items.map(() => null)
  },
}

type UnsopportedMethod = keyof typeof unsupportedServerRequestHandlers

export interface UnsupportedRequest extends RequestMessage {
  method: UnsopportedMethod
}

export function isUnsupportedRequest(message: Message): message is UnsupportedRequest {
  if (!Message.isRequest(message)) {
    return false
  }

  return Object.keys(unsupportedServerRequestHandlers).includes(message.method)
}

export type ServerRequestInterception = {
  handled: boolean
  result?: unknown
}

/**
 * Answers the server requests the browser client can't, so the server doesn't
 * log errors.
 */
export const handledUnsupportedRequest = (message: UnsupportedRequest) => {
  return unsupportedServerRequestHandlers[message.method](message.params)
}
