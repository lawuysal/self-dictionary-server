/*
  Warnings:

  - You are about to drop the column `meaning` on the `Note` table. All the data in the column will be lost.
  - Added the required column `translation` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "meaning",
ADD COLUMN     "translation" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Preference" ALTER COLUMN "theme" SET DEFAULT 'system';
