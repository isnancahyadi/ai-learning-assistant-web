import z, { ZodError } from "zod";

const EnvSchema = z.object({
  APP_ENV: z.enum(["dev", "prod"]),
  API_URL: z.string(),
  PROJECT_NAME: z.string(),
  APP_NAME: z.string(),
});

export type EnvVars = z.infer<typeof EnvSchema>;
let env: EnvVars;

try {
  env = EnvSchema.parse(import.meta.env);
} catch (error) {
  if (error instanceof ZodError) {
    console.error("Missing environment");
    process.exit(1);
  } else {
    throw error;
  }
}

export { env };
