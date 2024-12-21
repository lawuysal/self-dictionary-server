-- CreateTable
CREATE TABLE "CronDailyAverageAllNotesIntensity" (
    "id" SERIAL NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" UUID NOT NULL,

    CONSTRAINT "CronDailyAverageAllNotesIntensity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CronDailyAverageAllNotesIntensity" ADD CONSTRAINT "CronDailyAverageAllNotesIntensity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
