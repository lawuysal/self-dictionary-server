import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { GetTTSRequestSchema } from "../dtos/getTTSRequest.dto";
import { createHash } from "crypto";
import { ttsRepository } from "../tts.repository";

export async function checkTTSRecord(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsedBody = GetTTSRequestSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: parsedBody.error.message,
    });
    return;
  }

  const { language, speed } = parsedBody.data;
  const text = parsedBody.data.text.trim().toLocaleLowerCase();
  const hash = createHash("sha256")
    .update(text + language + speed)
    .digest("hex");

  const ttsRecord = await ttsRepository.getTTSRecord(hash);
  if (ttsRecord) {
    res.status(StatusCodes.OK).json({ path: ttsRecord.filePath });
    return;
  }

  req.body.hash = hash;
  req.body.text = text;
  req.body.language = language;
  req.body.speed = speed;

  next();
}
