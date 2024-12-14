import { z } from "zod";
import { SupportedTTSLanguagesEnum } from "../enums/supportedTTSLanguages.enum";
import { SupportedTTSSpeeds } from "../enums/supportedTTSSpeeds.enum";

export const GetTTSRequestSchema = z.object({
  text: z.string().max(30),
  language: z.nativeEnum(SupportedTTSLanguagesEnum),
  speed: z.nativeEnum(SupportedTTSSpeeds),
});

export type GetTTSRequestDto = z.infer<typeof GetTTSRequestSchema>;
