-- CreateTable
CREATE TABLE "LatestQuizScores" (
    "id" SERIAL NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "wrongAnswers" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" UUID NOT NULL,

    CONSTRAINT "LatestQuizScores_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LatestQuizScores" ADD CONSTRAINT "LatestQuizScores_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
