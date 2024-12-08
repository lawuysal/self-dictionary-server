import { z } from "zod";

export const CreatePositiveActionToPostRequestSchema = z.object({
  socialPostId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type CreatePositiveActionToPostRequestDto = z.infer<
  typeof CreatePositiveActionToPostRequestSchema
>;
