-- CreateTable
CREATE TABLE "FollowedUserOnUsers" (
    "followerUserId" UUID NOT NULL,
    "followedUserId" UUID NOT NULL,
    "followedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowedUserOnUsers_pkey" PRIMARY KEY ("followerUserId","followedUserId")
);

-- AddForeignKey
ALTER TABLE "FollowedUserOnUsers" ADD CONSTRAINT "FollowedUserOnUsers_followerUserId_fkey" FOREIGN KEY ("followerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowedUserOnUsers" ADD CONSTRAINT "FollowedUserOnUsers_followedUserId_fkey" FOREIGN KEY ("followedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
