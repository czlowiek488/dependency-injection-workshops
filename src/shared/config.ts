import { inspect } from "util";
import { z as zod } from "zod";

const appConfigValidation = zod
  .object({
    NODE_STAGE: zod.string(),
    PORT: zod.number({ coerce: true }),
    user: zod.string(),
    password: zod.string(),
    database: zod.string(),
    host: zod.string(),
    port: zod.number({ coerce: true }),
  })
  .safeParse({
    NODE_STAGE: process.env.NODE_STAGE,
    PORT: process.env.PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
  });

if (appConfigValidation.success === false) {
  throw Error(`Environment variables validation error: ${appConfigValidation.error.toString()}`);
}

console.log(`Application initialized with config: ${inspect(appConfigValidation.data, false, Infinity)}`);
export const appConfig = appConfigValidation.data;
