import z from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  MAX_CONNECTIONS: z.coerce.number().int().positive().default(20),
})

export const { PORT, MAX_CONNECTIONS } = envSchema.parse(process.env)
