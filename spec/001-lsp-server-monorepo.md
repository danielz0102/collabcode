---
id: 001
date: 13-09-2026
status: completed
---

# LSP Server and Monorepo Restructure

## Overview

Collabcode is currently a single Next.js app with a CodeMirror editor. This change:

1. Converts the repo into a pnpm monorepo with two packages: `apps/web` (the Next.js app) and `apps/server` (a Node.js LSP bridge server).
2. Adds a Node.js server that accepts WebSocket connections and, for each connection, spawns a `typescript-language-server --stdio` child process, bridging JSON-RPC messages between the browser and the LSP server.
3. Integrates `@codemirror/lsp-client` into the editor so it connects to the bridge over WebSocket and gets TypeScript completions for a virtual in-memory file.

### Decisions

- **Monorepo layout**: `apps/web` + `apps/server`, with `pnpm-workspace.yaml` gaining `packages: ["apps/*"]`. The root keeps only tooling (oxlint/oxfmt) and orchestration scripts.
- **LSP process model**: one `typescript-language-server --stdio` process per WebSocket connection (1:1). Simple and isolated; a shared process can come later.
- **File model**: the editor opens a fully virtual in-memory file `file:///workspace/main.ts`. The content is a hardcoded TypeScript constant in the web app. The LSP client sends `rootUri: null` (the `@codemirror/lsp-client` default), which `typescript-language-server` accepts and serves from a default project.
- **Ports**: Next.js on 3000, LSP bridge on 3001. The web app reads the WebSocket URL from `NEXT_PUBLIC_LSP_WS_URL`, defaulting to `ws://localhost:3001`.
- **Dev workflow**: two root scripts — `pnpm dev:web` and `pnpm dev:server` — running the packages via `pnpm --filter`.
- **Bridge framing**: `vscode-jsonrpc`'s `StreamMessageReader`/`StreamMessageWriter` handle LSP's Content-Length framing on the child's stdio. The WebSocket side carries raw JSON strings (one message per frame), matching `@codemirror/lsp-client`'s `Transport` interface.
- **`typescript` is a runtime dependency of `apps/server`**: `typescript-language-server` does not declare it, but its bundled CLI resolves `tsserver.js` via `require.resolve('typescript')` at runtime, so the package must be installed for the server to work.

### Alternatives considered

- **Next.js custom server** (`httpServer` option) instead of a separate process: rejected because the user wants a standalone server package in the monorepo.
- **`codemirror-languageserver`** (third-party) instead of `@codemirror/lsp-client`: rejected — the official package is the user's choice and is actively maintained.
- **Real file on disk** instead of virtual: rejected — the user wants a virtual in-memory file for a quick completion test.
- **Hand-rolled Content-Length framing parser**: rejected in favor of `vscode-jsonrpc`, which is battle-tested and already handles partial reads.
- **Server-side workspace directory + rootUri rewrite**: tested and rejected — `typescript-language-server` accepts `rootUri: null` and serves virtual files from a default project, so no real directory is needed.

## Tasks

### 1. Convert to a pnpm monorepo

Depends on: nothing

1. Update `pnpm-workspace.yaml` to add:
   ```yaml
   packages:
     - apps/*
   ```
2. Move the Next.js app into `apps/web/`:
   - `src/` → `apps/web/src/`
   - `next.config.ts` → `apps/web/next.config.ts`
   - `postcss.config.mjs` → `apps/web/postcss.config.mjs`
   - `tsconfig.json` → `apps/web/tsconfig.json` (unchanged; `@/*` → `./src/*` stays correct relative to the new location)
   - `next-env.d.ts` → `apps/web/next-env.d.ts`
   - `public/` → `apps/web/public/`
3. Create `apps/web/package.json`:
   ```json
   {
     "name": "web",
     "private": true,
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start"
     },
     "dependencies": {
       "@codemirror/autocomplete": "^6.20.3",
       "@codemirror/commands": "^6.11.0",
       "@codemirror/lang-javascript": "^6.2.5",
       "@codemirror/lsp-client": "^6.2.5",
       "@codemirror/state": "^6.7.4",
       "@codemirror/theme-one-dark": "^6.1.3",
       "@codemirror/view": "^6.43.11",
       "codemirror": "^6.0.2",
       "next": "16.3.5",
       "react": "19.2.8",
       "react-dom": "19.2.8"
     },
     "devDependencies": {
       "@tailwindcss/postcss": "^4",
       "@types/node": "^20",
       "@types/react": "^19",
       "@types/react-dom": "^19",
       "babel-plugin-react-compiler": "1.0.0",
       "tailwindcss": "^4",
       "typescript": "^5"
     }
   }
   ```
4. Update the root `package.json`:
   - Remove all app dependencies (they now live in `apps/web`).
   - Keep `oxfmt`, `oxlint`, `oxlint-tsgolint` as devDependencies.
   - Replace scripts with:
     ```json
     "scripts": {
       "dev:web": "pnpm --filter web dev",
       "dev:server": "pnpm --filter server dev",
       "lint": "oxlint",
       "format": "oxfmt"
     }
     ```
   - Keep `"packageManager": "pnpm@11.25.0"`.
5. Create `apps/server/package.json`:
   ```json
   {
     "name": "server",
     "private": true,
     "type": "module",
     "scripts": {
       "dev": "tsx watch src/index.ts"
     },
     "dependencies": {
       "typescript": "^5",
       "typescript-language-server": "^6.0.0",
       "vscode-jsonrpc": "^9.0.2",
       "ws": "^8.21.3"
     },
     "devDependencies": {
       "@types/node": "^20",
       "@types/ws": "^8",
       "tsx": "^4",
       "typescript": "^5"
     }
   }
   ```
   Note: `typescript` is listed as a runtime dependency because `typescript-language-server` resolves `tsserver.js` from it at runtime, even though it is not declared by that package.
6. Create `apps/server/tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "lib": ["ES2022"],
       "module": "NodeNext",
       "moduleResolution": "NodeNext",
       "strict": true,
       "noEmit": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "types": ["node"]
     },
     "include": ["src"]
   }
   ```
7. Update `.gitignore` so patterns match inside packages (root-anchored patterns no longer match `apps/*`):
   - `/node_modules` → `node_modules`
   - `/.next/` → `.next/`
   - `/out/` → `out/`
   - `/build` → `build`
   - `/coverage` → `coverage`
8. Run `pnpm install` to regenerate the lockfile for the workspace.

### 2. Build the LSP bridge server

Depends on: 1

Create `apps/server/src/index.ts`:

```ts
import { WebSocketServer } from "ws"
import { createLspBridge } from "./lsp.js"

const port = Number(process.env.PORT ?? 3001)
const wss = new WebSocketServer({ port })

wss.on("connection", (ws) => {
  const bridge = createLspBridge(ws)
  ws.on("close", () => bridge.dispose())
  ws.on("error", () => bridge.dispose())
})

console.log(`LSP bridge listening on ws://localhost:${port}`)
```

Create `apps/server/src/lsp.ts`:

```ts
import { spawn } from "node:child_process"
import { StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc/node"
import { WebSocket } from "ws"

export function createLspBridge(ws: WebSocket) {
  const child = spawn("typescript-language-server", ["--stdio"], {
    stdio: ["pipe", "pipe", "pipe"],
  })

  const reader = new StreamMessageReader(child.stdout)
  const writer = new StreamMessageWriter(child.stdin)

  reader.listen((message) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message))
  })

  ws.on("message", (data) => {
    writer.write(JSON.parse(data.toString()))
  })

  child.stderr.on("data", (chunk) => console.error(`[lsp] ${chunk.toString()}`))
  child.on("exit", () => ws.close())

  return {
    dispose() {
      child.kill()
    },
  }
}
```

Notes:

- `spawn("typescript-language-server", ...)` relies on PATH; pnpm adds `apps/server/node_modules/.bin` to PATH when running the package's scripts. If resolution ever fails, resolve the binary explicitly with `createRequire(import.meta.url).resolve("typescript-language-server/package.json")` and join `lib/cli.mjs`.
- ESM relative imports need the `.js` extension under `NodeNext`; `tsx` handles this in dev.

### 3. Integrate the LSP client in the web app

Depends on: 1

1. Add `@codemirror/lsp-client` to `apps/web` dependencies (already in the package.json from task 1).
2. Create `apps/web/src/editor/transport.ts`:
   ```ts
   import type { Transport } from "@codemirror/lsp-client"

   export function webSocketTransport(uri: string): Promise<Transport> {
     let handlers: ((value: string) => void)[] = []
     const sock = new WebSocket(uri)
     sock.onmessage = (e) => {
       for (const h of handlers) h(e.data.toString())
     }
     return new Promise((resolve, reject) => {
       sock.onopen = () =>
         resolve({
           send(message: string) {
             sock.send(message)
           },
           subscribe(handler: (value: string) => void) {
             handlers.push(handler)
           },
           unsubscribe(handler: (value: string) => void) {
             handlers = handlers.filter((h) => h !== handler)
           },
         })
       sock.onerror = () => reject(new Error(`WebSocket connection to ${uri} failed`))
     })
   }
   ```
3. Update `apps/web/src/editor/index.ts`:
   - Switch the language from `javascript()` to `typescriptLanguage` (from `@codemirror/lang-javascript`).
   - Create the LSP client and connect it before creating the view (the workspace sends `didOpen` only after `connect`).
   - Use `languageServerExtensions()` for completion/hover/signature/diagnostics.
   - Make creation async via a static `create` factory.
   ```ts
   import { typescriptLanguage } from "@codemirror/lang-javascript"
   import { LSPClient, languageServerExtensions } from "@codemirror/lsp-client"
   import { oneDark } from "@codemirror/theme-one-dark"
   import { EditorView } from "@codemirror/view"
   import { basicSetup } from "codemirror"
   import { webSocketTransport } from "./transport"

   const fullHeightTheme = EditorView.theme({
     "&": { height: "100%" },
     ".cm-scroller": { overflow: "auto" },
     ".cm-content": { fontFamily: "var(--font-mono)" },
   })

   const WS_URL = process.env.NEXT_PUBLIC_LSP_WS_URL ?? "ws://localhost:3001"
   const FILE_URI = "file:///workspace/main.ts"

   export class Editor {
     private view: EditorView

     private constructor(code: string, parent: HTMLElement, client: LSPClient) {
       this.view = new EditorView({
         doc: code,
         extensions: [
           basicSetup,
           typescriptLanguage,
           client.plugin(FILE_URI, "typescript"),
           fullHeightTheme,
           oneDark,
         ],
         parent,
       })
     }

     static async create(code: string, parent: HTMLElement): Promise<Editor> {
       const transport = await webSocketTransport(WS_URL)
       const client = new LSPClient({
         extensions: languageServerExtensions(),
       }).connect(transport)
       return new Editor(code, parent, client)
     }

     destroy() {
       this.view.destroy()
     }
   }
   ```
   Note: `rootUri` is intentionally omitted — `@codemirror/lsp-client` sends `rootUri: null`, which `typescript-language-server` accepts and serves from a default project.
4. Update `apps/web/src/components/file.tsx` to handle async editor creation and cleanup:
   ```tsx
   "use client"

   import { useEffect, useRef } from "react"

   import { Editor } from "@/editor"

   export function File({ code }: { code: string }) {
     const parentRef = useRef<HTMLDivElement>(null)

     useEffect(() => {
       if (!parentRef.current) {
         throw new Error("Code editor parent ref is not set")
       }

       let editor: Editor | null = null
       let cancelled = false

       Editor.create(code, parentRef.current).then((created) => {
         if (cancelled) created.destroy()
         else editor = created
       })

       return () => {
         cancelled = true
         editor?.destroy()
       }
     }, [code])

     return <div ref={parentRef} className="h-full" />
   }
   ```
5. Update `apps/web/src/app/page.tsx` to use TypeScript dummy content that demonstrates completions:
   ```tsx
   import { File } from "../components/file"

   const code = `interface User {
     name: string
     age: number
   }
   
   const user: User = { name: "Alice", age: 30 }
   
   // Place the cursor after "user." to see property completions
   user.
   `

   export default function Home() {
     return (
       <div className="h-dvh">
         <File code={code} />
       </div>
     )
   }
   ```

### 4. Verify

Depends on: 2, 3

1. Run `pnpm install` (if not already done in task 1).
2. Run `pnpm lint` and `pnpm format` and fix any issues.
3. Manual test (see Testing).

## Testing

The repo has no automated test framework configured, so verification is manual.

### Manual integration test

| Use case               | Input data                                      | Expected output                                              |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| LSP bridge starts      | `pnpm dev:server`                               | Logs `LSP bridge listening on ws://localhost:3001`           |
| Web app starts         | `pnpm dev:web`                                  | App available at `http://localhost:3000`                     |
| Editor connects to LSP | Open the page                                   | No console errors; editor shows the TypeScript dummy content |
| Completions work       | Place cursor after `user.` in the dummy file    | Autocomplete popup lists `age` and `name` properties         |
| Diagnostics work       | Introduce a type error (e.g., `user.age = "x"`) | Error underline/diagnostic appears                           |

## Checklist

- [x] Task 1: Convert to a pnpm monorepo
- [x] Task 2: Build the LSP bridge server
- [x] Task 3: Integrate the LSP client in the web app
- [x] Task 4: Verify (lint, format, manual test)
- [x] All tests pass
