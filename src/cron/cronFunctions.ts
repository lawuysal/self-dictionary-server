import { prisma } from "@/prisma/client";
import { getUsersAverageNoteIntensity } from "@prisma/client/sql";

async function getAverageNoteIntensity() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingRecords =
    await prisma.cronDailyAverageAllNotesIntensity.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

  if (existingRecords.length > 0) {
    console.log("Records for today already exist. Skipping...");
    return;
  }

  const averageIntensities = await prisma.$queryRawTyped(
    getUsersAverageNoteIntensity(),
  );

  await prisma.cronDailyAverageAllNotesIntensity.createMany({
    data: averageIntensities as unknown as {
      ownerId: string;
      average: number;
    }[],
  });

  console.log("New records added:", averageIntensities);
}

export { getAverageNoteIntensity };
