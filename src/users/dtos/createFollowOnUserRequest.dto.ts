import { z } from "zod";

export const CreateFollowOnUserRequestSchema = z.object({
  followingId: z.string().uuid(),
  followedById: z.string().uuid(),
});

export type CreateFollowOnUserRequestDto = z.infer<
  typeof CreateFollowOnUserRequestSchema
>;
