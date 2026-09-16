# Collabcode

Collabcode is a real-time collaborative code editor. The project is a monorepo with two packages that are contained in the `apps` folder:

- `apps/web`: Next.js web app, where the code editor lives
- `apps/server`: Node.js server to handle WebSocket connections to LSP servers

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Guidelines

- Always use Context7 to answer questions about CodeMirror, or to use the library.
