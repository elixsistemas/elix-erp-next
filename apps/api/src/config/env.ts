import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3333),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(1433),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_ENCRYPT: z.coerce.boolean().default(false)
});

export const env = EnvSchema.parse(process.env);
