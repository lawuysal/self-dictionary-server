import { z } from "zod";

export const UpdateNoteRequesSchema = z.object({
  name: z.string().min(1).max(150),
  translation: z.string().min(1).max(150),
  languageId: z.string().uuid(),
});

export type UpdateNoteRequestDto = z.infer<typeof UpdateNoteRequesSchema>;
