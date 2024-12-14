import { prisma } from "@/prisma/client";

async function getTTSRecord(hash: string) {
  const tts = await prisma.tTSFile.findFirst({
    where: {
      id: hash,
    },
  });

  return tts;
}

async function createTTSRecord(
  hash: string,
  createdById: string,
  text: string,
  languageCode: string,
  voiceName: string,
  audioEncoding: string,
  speakingRate: number,
  filePath: string,
) {
  const tts = await prisma.tTSFile.create({
    data: {
      id: hash,
      createdById,
      text,
      languageCode,
      voiceName,
      audioEncoding,
      speakingRate,
      filePath,
    },
  });

  return tts;
}

export const ttsRepository = {
  getTTSRecord,
  createTTSRecord,
};
