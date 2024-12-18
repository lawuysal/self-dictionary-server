import { z } from "zod";

export const UpdateNotePropertyRequestSchema = z.object({
  notePropertyId: z.string(),
  name: z.string(),
  value: z.string(),
  description: z.string(),
});

export type UpdateNotePropertyRequestDto = z.infer<
  typeof UpdateNotePropertyRequestSchema
>;
