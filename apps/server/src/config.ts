import { loadEnvFile } from "node:process"

import z from "zod"

try {
  loadEnvFile()
} catch {
  console.warn(".env file was not found")
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  MAX_CONNECTIONS: z.coerce.number().int().positive().default(20),
})

export const { PORT, MAX_CONNECTIONS } = envSchema.parse(process.env)
