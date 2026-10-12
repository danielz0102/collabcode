import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    //* Workaround to prevent `y-monaco` dependency from importing the long path, which is not available in the last version of Monaco editor anymore
    resolveAlias: {
      "monaco-editor/esm/vs/editor/editor.api.js": "monaco-editor",
    },
  },
}

export default nextConfig
