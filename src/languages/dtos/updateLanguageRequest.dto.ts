import { z } from "zod";

export const UpdateLanguageRequestSchema = z.object({
  name: z
    .string()
    .min(2, "A language name must be at least 2 characters long.")
    .max(25, "A language name must be at most 25 characters."),
  description: z
    .string()
    .min(
      5,
      "A language description must be empty or at least 5 characters long.",
    )
    .max(200, "A language description must be at most 200 characters")
    .nullable(),
  ownerId: z.string().uuid(),
});

export type UpdateLanguageRequestDto = z.infer<
  typeof UpdateLanguageRequestSchema
>;
