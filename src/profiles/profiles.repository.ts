import { prisma } from "@/prisma/client";
import { Profile } from "@prisma/client";
import { CreateProfileRequestDto } from "./dtos/createProfileRequest.dto";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../middlewares/globalErrorMiddleware";
import { UpdateProfileRequestDto } from "./dtos/updateProfileRequest.dto";

/**
 * Gets all profiles.
 * @async
 *
 * @returns {Promise<Profile[]>} A promise that resolves to an array of profiles.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function getProfiles(): Promise<Profile[]> {
  return await prisma.profile.findMany();
}

/**
 * Gets a profile by id.
 * @async
 *
 * @param {string} id - The id of the profile to get.
 *
 * @returns {Promise<Profile | null>} A promise that resolves to the profile if found, otherwise null.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function getProfileById(id: string): Promise<Profile | null> {
  return await prisma.profile.findUnique({ where: { id } });
}

/**
 * Gets a profile by user id.
 * @async
 *
 * @param {string} userId - The id of the user to get profile for.
 *
 * @returns {Promise<Profile | null>} A promise that resolves to the profile if found, otherwise null.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function getProfileByUserId(userId: string) {
  return await prisma.profile.findUnique({ where: { ownerId: userId } });
}

/**
 * Creates a new profile.
 * @async
 *
 * @param {CreateProfileRequestDto} profileData - The data to create the profile.
 * @param {string} profileData.username - The username of the profile.
 * @param {string} profileData.ownerId - The id of the user that owns the profile.
 * @param {string} profileData.firstName - The first name of the profile.
 * @param {string | null} profileData.lastName - The last name of the profile.
 * @param {string | null} profileData.bio - The bio of the profile.
 * @param {string | null} profileData.photoUrl - The photo url of the profile.
 *
 * @returns {Promise<Profile>} A promise that resolves to the created profile.
 *
 * @throws {AppError} Throws an AppError if the username already exists.
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function createProfile(
  profileData: CreateProfileRequestDto,
): Promise<Profile> {
  const existingUsername = await prisma.profile.findUnique({
    where: { username: profileData.username },
  });

  if (existingUsername) {
    throw new AppError("Username already exists", StatusCodes.CONFLICT);
  }

  return await prisma.profile.create({
    data: {
      ...profileData,
    },
  });
}

/**
 * Updates a profile.
 * @async
 *
 * @param {UpdateProfileRequestDto} updateData - The data to update the profile.
 * @param {string} updateData.ownerId - The id of the user that owns the profile.
 * @param {string} updateData.username - The username of the profile.
 * @param {string} updateData.firstName - The first name of the profile.
 * @param {string | null} updateData.lastName - The last name of the profile.
 * @param {string | null} updateData.bio - The bio of the profile.
 * @param {string | null} updateData.photoUrl - The photo url of the profile.
 *
 * @returns {Promise<Profile>} A promise that resolves to the updated profile.
 *
 * @throws {AppError} Throws an AppError if the profile is not found.
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function updateProfile(
  updateData: UpdateProfileRequestDto,
): Promise<Profile> {
  const profile = await prisma.profile.findUnique({
    where: { ownerId: updateData.ownerId },
  });

  if (!profile) {
    throw new AppError("Profile not found", StatusCodes.NOT_FOUND);
  }

  return await prisma.profile.update({
    where: { ownerId: updateData.ownerId },
    data: {
      ...updateData,
    },
  });
}

export const profilesRepository = {
  getProfiles,
  getProfileById,
  getProfileByUserId,
  createProfile,
  updateProfile,
};
