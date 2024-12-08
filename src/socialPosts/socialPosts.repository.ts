import { prisma } from "@/prisma/client";
import { CreateSocialPostRequestDto } from "./dtos/createSocialPostRequest.dto";
import { CreatePositiveActionToPostRequestDto } from "./dtos/createPositiveActionToPostRequest.dto";
import { GetSocialPostResponseDto } from "./dtos/getSocialPostsResponse.dto";

async function getSocialPosts() {
  const socialPosts = await prisma.socialPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              photoUrl: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: { positiveActionOnSocialPosts: true },
      },
      positiveActionOnSocialPosts: {
        orderBy: {
          positiveActionAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const socialPostsResponse: GetSocialPostResponseDto[] = socialPosts.map(
    (socialPost) => {
      return {
        id: socialPost.id,
        content: socialPost.content,
        createdAt: socialPost.createdAt.toISOString(),
        owner: {
          ownerId: socialPost.ownerId,
          firstName: socialPost.owner.profile?.firstName as string,
          lastName: socialPost.owner.profile?.lastName as string,
          photoUrl: socialPost.owner.profile?.photoUrl as string,
          username: socialPost.owner.profile?.username as string,
        },
        positiveActionCount: socialPost._count.positiveActionOnSocialPosts,
        positiveActionsBy: socialPost.positiveActionOnSocialPosts.map(
          (positiveAction) => {
            return {
              userId: positiveAction.user.id,
              userFirstName: positiveAction.user.profile?.firstName as string,
              userLastName: positiveAction.user.profile?.lastName as string,
              userUsername: positiveAction.user.profile?.username as string,
              positiveActionAt: positiveAction.positiveActionAt.toISOString(),
            };
          },
        ),
      };
    },
  );

  return socialPostsResponse;
}

async function getSocialPostById(socialPostId: string) {
  const socialPost = await prisma.socialPost.findUnique({
    where: { id: socialPostId },
    include: {
      owner: {
        select: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
              photoUrl: true,
            },
          },
        },
      },
      _count: {
        select: { positiveActionOnSocialPosts: true },
      },
      positiveActionOnSocialPosts: {
        orderBy: {
          positiveActionAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!socialPost) {
    return;
  }

  const socialPostResponse: GetSocialPostResponseDto = {
    id: socialPost.id,
    content: socialPost.content,
    createdAt: socialPost.createdAt.toISOString(),
    owner: {
      ownerId: socialPost.ownerId,
      firstName: socialPost.owner.profile?.firstName as string,
      lastName: socialPost.owner.profile?.lastName as string,
      photoUrl: socialPost.owner.profile?.photoUrl as string,
      username: socialPost.owner.profile?.username as string,
    },
    positiveActionCount: socialPost._count.positiveActionOnSocialPosts,
    positiveActionsBy: socialPost.positiveActionOnSocialPosts.map(
      (positiveAction) => {
        return {
          userId: positiveAction.user.id,
          userFirstName: positiveAction.user.profile?.firstName as string,
          userLastName: positiveAction.user.profile?.lastName as string,
          userUsername: positiveAction.user.profile?.username as string,
          positiveActionAt: positiveAction.positiveActionAt.toISOString(),
        };
      },
    ),
  };

  return socialPostResponse;
}

async function createSocialPost(data: CreateSocialPostRequestDto) {
  const socialPost = await prisma.socialPost.create({
    data: {
      content: data.content,
      ownerId: data.ownerId,
    },
  });
  return socialPost;
}

async function getPositiveActionById(
  data: CreatePositiveActionToPostRequestDto,
) {
  const positiveAction = await prisma.positiveActionOnSocialPosts.findUnique({
    where: {
      postId_userId: {
        postId: data.socialPostId,
        userId: data.userId,
      },
    },
  });
  return positiveAction;
}

async function createPositiveActionOnPostById(
  data: CreatePositiveActionToPostRequestDto,
) {
  await prisma.positiveActionOnSocialPosts.create({
    data: {
      postId: data.socialPostId,
      userId: data.userId,
    },
  });

  const socialPost = await getSocialPostById(data.socialPostId);

  return socialPost;
}

async function deletePositiveActionOnPostById(
  data: CreatePositiveActionToPostRequestDto,
) {
  await prisma.positiveActionOnSocialPosts.delete({
    where: {
      postId_userId: {
        postId: data.socialPostId,
        userId: data.userId,
      },
    },
  });

  const socialPost = await getSocialPostById(data.socialPostId);

  return socialPost;
}

export const socialPostsRepository = {
  getSocialPosts,
  getSocialPostById,
  createSocialPost,
  getPositiveActionById,
  createPositiveActionOnPostById,
  deletePositiveActionOnPostById,
};
