import { z } from "zod";
import { Themes } from "../enums/themes.enum";
import { Languages } from "../enums/languages.enum";

export const CreatePreferenceRequestSchema = z.object({
  theme: z.nativeEnum(Themes),
  language: z.nativeEnum(Languages),
  ownerId: z.string().uuid(),
});

export type CreatePreferenceRequestDto = z.infer<
  typeof CreatePreferenceRequestSchema
>;
