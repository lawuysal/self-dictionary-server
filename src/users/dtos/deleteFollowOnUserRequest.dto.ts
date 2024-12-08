import { z } from "zod";

export const DeleteFollowOnUserRequestSchema = z.object({
  followingId: z.string().uuid(),
  followedById: z.string().uuid(),
});

export type DeleteFollowOnUserRequestDto = z.infer<
  typeof DeleteFollowOnUserRequestSchema
>;
