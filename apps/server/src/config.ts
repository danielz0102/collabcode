import { loadEnvFile, env } from "node:process"

import z from "zod"

const areEnvVarsLoaded = env["PORT"] !== undefined

if (!areEnvVarsLoaded) {
  loadEnvFile()
}

const envSchema = z.object({ PORT: z.coerce.number().int().positive().default(3001) })

export const { PORT } = envSchema.parse(env)
