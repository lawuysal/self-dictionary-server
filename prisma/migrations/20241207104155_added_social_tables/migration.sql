-- CreateTable
CREATE TABLE "SocialPost" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" UUID NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositiveActionOnSocialPost" (
    "postId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "positiveActionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PositiveActionOnSocialPost_pkey" PRIMARY KEY ("postId","userId")
);

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositiveActionOnSocialPost" ADD CONSTRAINT "PositiveActionOnSocialPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositiveActionOnSocialPost" ADD CONSTRAINT "PositiveActionOnSocialPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
