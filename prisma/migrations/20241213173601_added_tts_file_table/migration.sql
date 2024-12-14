-- CreateTable
CREATE TABLE "TTSFile" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "voiceName" TEXT NOT NULL,
    "audioEncoding" TEXT NOT NULL,
    "speakingRate" DOUBLE PRECISION NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TTSFile_pkey" PRIMARY KEY ("id")
);
