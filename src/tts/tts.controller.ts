import { Router } from "express";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import { Roles } from "../roles/enums/roles.enum";
import asyncHandler from "../utils/asyncHandler";
import { StatusCodes } from "http-status-codes";
import fs from "fs";
import { protos, TextToSpeechClient } from "@google-cloud/text-to-speech";
import { checkTTSRecord } from "./middlewares/checkTTSRecord.middleware";
import { SupportedTTSLanguages } from "./enums/supportedTTSLanguages.enum";
import { ttsRepository } from "./tts.repository";
import { SupportedTTSSpeeds } from "./enums/supportedTTSSpeeds.enum";

const router = Router();
const ttsClient = new TextToSpeechClient();

// Get TTS file path
// POST /api/tts
router.route("/").post(
  authGuard(Roles.USER),
  checkTTSRecord,
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
      {
        input: { text: req.body.text },
        voice: {
          languageCode: SupportedTTSLanguages.get(req.body.language)
            ?.languageCode,
          name: SupportedTTSLanguages.get(req.body.language)?.name,
        },
        audioConfig: {
          audioEncoding: "OGG_OPUS",
          speakingRate: req.body.speed,
        },
      };

    const [response] = await ttsClient.synthesizeSpeech(request);

    if (!response.audioContent) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "No audio content" });
      return;
    }

    const environment = process.env.NODE_ENV || "";

    fs.mkdirSync(
      `${environment === "PRODUCTION" ? "/var/www/html/static" : "public"}/tts/${req.body.language}`,
      {
        recursive: true,
      },
    );
    fs.writeFileSync(
      `${environment === "PRODUCTION" ? "/var/www/html/static" : "public"}/tts/${req.body.language}/${req.body.hash}.ogg`,
      response.audioContent,
      "base64",
    );

    const ttsRecord = await ttsRepository.createTTSRecord(
      req.body.hash,
      userId,
      req.body.text,
      SupportedTTSLanguages.get(req.body.language)?.languageCode as string,
      SupportedTTSLanguages.get(req.body.language)?.name as string,
      "OGG_OPUS",
      req.body.speed,
      `${environment === "PRODUCTION" ? "/var/www/html/static" : "public"}/tts/${req.body.language}/${req.body.hash}.ogg`,
    );

    res.status(StatusCodes.OK).json({ path: ttsRecord.filePath });
  }),
);

// Get supported TTS speeds
// GET /api/tts/speeds
router.route("/speeds").get(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    res.status(StatusCodes.OK).json({
      NORMAL: SupportedTTSSpeeds.NORMAL,
      SLOW: SupportedTTSSpeeds.SLOW,
    });
  }),
);
export const ttsController = router;
