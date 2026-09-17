import { z } from "zod"

export const clientConfigSchema = z.object({
  LSP_WS_URL: z.url(),
})

export const { LSP_WS_URL } = clientConfigSchema.parse({
  LSP_WS_URL: process.env.NEXT_PUBLIC_LSP_WS_URL,
})
