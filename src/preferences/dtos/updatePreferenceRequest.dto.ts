import { z } from "zod";
import { Themes } from "../enums/themes.enum";
import { Languages } from "../enums/languages.enum";

export const UpdatePreferenceRequestSchema = z.object({
  theme: z.nativeEnum(Themes),
  language: z.nativeEnum(Languages),
  ownerId: z.string().uuid(),
});

export type UpdatePreferenceRequestDto = z.infer<
  typeof UpdatePreferenceRequestSchema
>;
