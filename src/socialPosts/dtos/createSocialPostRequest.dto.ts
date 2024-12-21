import { z } from "zod";

export const CreateSocialPostRequestSchema = z.object({
  content: z
    .string()
    .min(2, "A social post content must be at least 2 characters long.")
    .max(200, "A social post content must be at most 200 characters."),
  ownerId: z.string().uuid(),
  isGenerated: z.boolean(),
});

export type CreateSocialPostRequestDto = z.infer<
  typeof CreateSocialPostRequestSchema
>;
