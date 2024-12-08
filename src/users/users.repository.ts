import { prisma } from "@/prisma/client";
import { CreateFollowOnUserRequestDto } from "./dtos/createFollowOnUserRequest.dto";
import { DeleteFollowOnUserRequestDto } from "./dtos/deleteFollowOnUserRequest.dto";

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
          _count: { select: { followedBy: true } },
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

  return followers;
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
          _count: { select: { following: true } },
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

  return followedUsers;
}

export const usersRepository = {
  getUserByUserId,
  createFollowOnUser,
  deleteFollowOnUser,
  getFollowOnUserById,
  getFollowersByUserId,
  getFollowedUsersByUserId,
};
