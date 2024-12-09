import { prisma } from "@/prisma/client";
import { CreateFollowOnUserRequestDto } from "./dtos/createFollowOnUserRequest.dto";
import { DeleteFollowOnUserRequestDto } from "./dtos/deleteFollowOnUserRequest.dto";
import { GetFollowedUsersResponseDto } from "./dtos/getFollowedUsersResponse.dto";
import { GetFollowersResponseDto } from "./dtos/getFollowersResponse.dto";

async function getUserByUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
}

async function getFollowOnUserById(followData: CreateFollowOnUserRequestDto) {
  const follow = await prisma.followsOnUsers.findUnique({
    where: {
      followedById_followingId: {
        followedById: followData.followedById,
        followingId: followData.followingId,
      },
    },
  });

  return follow;
}

async function createFollowOnUser(followData: CreateFollowOnUserRequestDto) {
  const follow = await prisma.followsOnUsers.create({
    data: {
      followedById: followData.followedById,
      followingId: followData.followingId,
    },
  });

  return follow;
}

async function deleteFollowOnUser(followData: DeleteFollowOnUserRequestDto) {
  const follow = await prisma.followsOnUsers.delete({
    where: {
      followedById_followingId: {
        followedById: followData.followedById,
        followingId: followData.followingId,
      },
    },
  });

  return follow;
}

async function getFollowersByUserId(userId: string) {
  const followers = await prisma.followsOnUsers.findMany({
    orderBy: { followedAt: "desc" },
    where: {
      followingId: userId,
    },
    include: {
      followedBy: {
        select: {
          id: true,
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
    },
  });

  const followersData: GetFollowersResponseDto = followers.map((follower) => {
    return {
      id: follower.followedBy.id,
      firstName: follower.followedBy.profile?.firstName || "",
      lastName: follower.followedBy.profile?.lastName || "",
      username: follower.followedBy.profile?.username || "",
      photoUrl: follower.followedBy.profile?.photoUrl || "",
    };
  });

  return followersData;
}

async function getFollowedUsersByUserId(userId: string) {
  const followedUsers = await prisma.followsOnUsers.findMany({
    orderBy: { followedAt: "desc" },
    where: {
      followedById: userId,
    },
    include: {
      following: {
        select: {
          id: true,
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
    },
  });

  const followedUsersData: GetFollowedUsersResponseDto = followedUsers.map(
    (followedUser) => {
      return {
        id: followedUser.following.id,
        firstName: followedUser.following.profile?.firstName || "",
        lastName: followedUser.following.profile?.lastName || "",
        username: followedUser.following.profile?.username || "",
        photoUrl: followedUser.following.profile?.photoUrl || "",
      };
    },
  );

  return followedUsersData;
}

export const usersRepository = {
  getUserByUserId,
  createFollowOnUser,
  deleteFollowOnUser,
  getFollowOnUserById,
  getFollowersByUserId,
  getFollowedUsersByUserId,
};
