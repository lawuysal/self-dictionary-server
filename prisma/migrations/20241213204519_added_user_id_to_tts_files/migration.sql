/*
  Warnings:

  - Added the required column `createdById` to the `TTSFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TTSFile" ADD COLUMN     "createdById" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "TTSFile" ADD CONSTRAINT "TTSFile_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
