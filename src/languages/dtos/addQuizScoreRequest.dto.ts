import { z } from "zod";

export const AddQuizScoreRequestSchema = z.object({
  correctAnswers: z.number(),
  wrongAnswers: z.number(),
});

export type AddQuizScoreRequestDto = z.infer<typeof AddQuizScoreRequestSchema>;
