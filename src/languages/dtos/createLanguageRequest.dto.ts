import { z } from "zod";

export const CreateLanguageRequestSchema = z.object({
  name: z
    .string()
    .min(3, "A language name must be at least 3 characters long.")
    .max(25, "A language name must be at most 25 characters."),
  description: z
    .string()
    .min(
      5,
      "A language description must be empty or at least 5 characters long.",
    )
    .max(100, "A language description must be at most 100 characters")
    .nullable(),
  ownerId: z.string().uuid(),
});

export type CreateLanguageRequestDto = z.infer<
  typeof CreateLanguageRequestSchema
>;
