import { loadEnvFile } from "node:process"

import z from "zod"

try {
  loadEnvFile()
} catch {
  console.warn(".env file was not found")
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  LSP_PORT: z.coerce.number().int().positive().default(3002),
})

export const { PORT, LSP_PORT } = envSchema.parse(process.env)
