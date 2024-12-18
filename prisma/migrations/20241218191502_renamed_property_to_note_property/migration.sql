/*
  Warnings:

  - You are about to drop the `Property` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_noteId_fkey";

-- DropTable
DROP TABLE "Property";

-- CreateTable
CREATE TABLE "NoteProperty" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "noteId" UUID NOT NULL,

    CONSTRAINT "NoteProperty_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NoteProperty" ADD CONSTRAINT "NoteProperty_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
