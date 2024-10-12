import { z } from "zod";

export const CreateProfileRequestSchema = z.object({
  firstName: z.string().min(2).max(30),
  lastName: z.string().min(2).max(30).nullable(),
  bio: z.string().max(150).nullable(),
  photoUrl: z.string().url().nullable(),
  username: z.string().min(2).max(30).toLowerCase(),
  ownerId: z.string().uuid(),
});

export type CreateProfileRequestDto = z.infer<
  typeof CreateProfileRequestSchema
>;
