/*
  Warnings:

  - You are about to drop the `FollowedUserOnUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FollowedUserOnUsers" DROP CONSTRAINT "FollowedUserOnUsers_followedUserId_fkey";

-- DropForeignKey
ALTER TABLE "FollowedUserOnUsers" DROP CONSTRAINT "FollowedUserOnUsers_followerUserId_fkey";

-- DropTable
DROP TABLE "FollowedUserOnUsers";

-- CreateTable
CREATE TABLE "FollowsOnUsers" (
    "followedById" UUID NOT NULL,
    "followingId" UUID NOT NULL,
    "followedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowsOnUsers_pkey" PRIMARY KEY ("followedById","followingId")
);

-- AddForeignKey
ALTER TABLE "FollowsOnUsers" ADD CONSTRAINT "FollowsOnUsers_followedById_fkey" FOREIGN KEY ("followedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowsOnUsers" ADD CONSTRAINT "FollowsOnUsers_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
