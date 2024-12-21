import { prisma } from "@/prisma/client";
import { getUsersAverageNoteIntensity } from "@prisma/client/sql";

async function getAverageNoteIntensity() {
  const averageIntensities = await prisma.$queryRawTyped(
    getUsersAverageNoteIntensity(),
  );

  await prisma.cronDailyAverageAllNotesIntensity.createMany({
    data: averageIntensities as unknown as {
      ownerId: string;
      average: number;
    }[],
  });

  console.log(averageIntensities);
}

export { getAverageNoteIntensity };
