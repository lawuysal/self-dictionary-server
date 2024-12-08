import { z } from "zod";

export const DeletePositiveActionOnPostRequestSchema = z.object({
  socialPostId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type DeletePositiveActionOnPostRequestDto = z.infer<
  typeof DeletePositiveActionOnPostRequestSchema
>;
