/*
  Warnings:

  - You are about to drop the `PositiveActionOnSocialPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PositiveActionOnSocialPost" DROP CONSTRAINT "PositiveActionOnSocialPost_postId_fkey";

-- DropForeignKey
ALTER TABLE "PositiveActionOnSocialPost" DROP CONSTRAINT "PositiveActionOnSocialPost_userId_fkey";

-- DropTable
DROP TABLE "PositiveActionOnSocialPost";

-- CreateTable
CREATE TABLE "PositiveActionOnSocialPosts" (
    "postId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "positiveActionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PositiveActionOnSocialPosts_pkey" PRIMARY KEY ("postId","userId")
);

-- AddForeignKey
ALTER TABLE "PositiveActionOnSocialPosts" ADD CONSTRAINT "PositiveActionOnSocialPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositiveActionOnSocialPosts" ADD CONSTRAINT "PositiveActionOnSocialPosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
