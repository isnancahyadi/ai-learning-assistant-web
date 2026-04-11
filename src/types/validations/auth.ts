import z from "zod";

export const RefreshTokenSchema = z
  .object({
    refresh_token: z.string(),
  })
  .required();

export type RefreshTokenPostType = z.infer<typeof RefreshTokenSchema>;
