import { z } from "zod";

export const UpdateNoteRequestSchema = z.object({
  name: z
    .string()
    .min(1, "A language name must be at least 1 characters long.")
    .max(150, "A language name must be at most 150 characters."),
  translation: z
    .string()
    .min(1, "A language translation must be at least 1 characters long.")
    .max(150, "A language description must be at most 150 characters"),
  description: z
    .string()
    .max(200, "A language description must be at most 200 characters.")
    .nullable()
    .nullish(),
  isPublic: z.boolean(),
  languageId: z.string().uuid(),
});

export type UpdateNoteRequestDto = z.infer<typeof UpdateNoteRequestSchema>;
