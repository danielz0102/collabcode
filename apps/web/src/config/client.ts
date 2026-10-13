import { z } from "zod"

export const clientConfigSchema = z.object({
  WS_URL: z.url(),
})

export const { WS_URL } = clientConfigSchema.parse({
  WS_URL: process.env.NEXT_PUBLIC_WS_URL,
})
