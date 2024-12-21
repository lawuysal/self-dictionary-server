import { Router } from "express";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/asyncHandler";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import { Roles } from "../roles/enums/roles.enum";
import { z } from "zod";

function extractSentences(text: string) {
  const pattern =
    /sentence:([^\n]*?)(?:\s*(?:word|wordTranslation|sentenceTranslation|Translation):[^\n]*)*?(?:\s*(?:sentenceTranslation|Translation):([^\n]*?)(?:\s*(?:word|wordTranslation|sentenceTranslation|Translation):[^\n]*)*)?(?:\n|$)/gs;

  const matches = [...text.matchAll(pattern)];

  const sentences = matches.map((match) => match[1].trim());
  const translations = matches.map((match) => match[2].trim());

  return [sentences[0], translations[0]];
}

const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_KEY || "");
const model = genAI.getGenerativeModel({
  model: process.env.GENERATIVE_AI_SENTENCE_MODEL || "",
});

const router = Router();

const sentenceGenerationRequestSchema = z.object({
  word: z.string(),
  translation: z.string(),
  wordLang: z.string().toUpperCase(),
  translationLang: z.string(),
});

// Get a random sentence
// POST: /api/generative-ai/get-sentence
router.route("/get-sentence").post(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).send("Unauthorized");
      return;
    }

    const parsedBody = sentenceGenerationRequestSchema.parse(req.body);

    const { word, translation } = parsedBody;
    const wordLang = parsedBody.wordLang.toUpperCase();
    const translationLang = parsedBody.translationLang.toUpperCase();

    const prompt = `word:${word} wordTranslation:${translation} wordLang:${wordLang} wordTranslationLang:${translationLang} sentenceLang:${wordLang} sentenceTranslationLang:${translationLang}`;
    const result = await model.generateContent(prompt);
    console.log(result.response.text());

    const [sentenceResult, sentenceTranslationResult] = extractSentences(
      result.response.text(),
    );

    if (sentenceResult === sentenceTranslationResult) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "A problem occured while generating sentence." });
      return;
    }

    res
      .status(StatusCodes.OK)
      .json({ sentenceResult, sentenceTranslationResult });
  }),
);

export const generativeAIController = router;
