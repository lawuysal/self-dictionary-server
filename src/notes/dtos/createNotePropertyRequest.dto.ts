import { z } from "zod";

export const CreateNotePropertyRequestSchema = z.object({
  noteId: z.string(),
  name: z.string(),
  value: z.string(),
  description: z.string(),
});

export type CreateNotePropertyRequestDto = z.infer<
  typeof CreateNotePropertyRequestSchema
>;
