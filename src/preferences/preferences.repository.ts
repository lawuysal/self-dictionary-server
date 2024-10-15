import { prisma } from "@/prisma/client";
import { Preference } from "@prisma/client";
import { CreatePreferenceRequestDto } from "./dtos/createPreferenceRequest.dto";
import { UpdatePreferenceRequestDto } from "./dtos/updatePreferenceRequest.dto";

/**
 * Gets all preferences.
 * @async
 *
 * @returns {Promise<Preference[]>} A promise that resolves to an array of preferences.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function getPreferences(): Promise<Preference[]> {
  return await prisma.preference.findMany();
}

/**
 * Gets a preference by id.
 * @async
 *
 * @param {string} id - The id of the preference to get.
 *
 * @returns {Promise<Preference | null>} A promise that resolves to the preference if found, otherwise null.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function getPreferenceById(id: string): Promise<Preference | null> {
  return await prisma.preference.findUnique({
    where: {
      id,
    },
  });
}

/**
 * Gets the preference of a user by user id.
 * @async
 *
 * @param {string} userId - The id of the user to get preference for.
 *
 * @returns {Promise<Preference | null>} A promise that resolves to the preference if found, otherwise null.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function getPreferenceByUserId(
  userId: string,
): Promise<Preference | null> {
  return await prisma.preference.findUnique({
    where: {
      ownerId: userId,
    },
  });
}

/**
 * Creates a new preference.
 * @async
 *
 * @param {CreatePreferenceRequestDto} preferenceData - The data to create the preference.
 * @param {string} prefrenceData.theme - The theme preference of the user.
 * @param {string} prefrenceData.language - The language preference of the user.
 * @param {string} prefrenceData.ownerId - The id of the user who owns preference.
 *
 * @returns {Promise<Preference>} A promise that resolves to the created preference.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function createPreference(
  preferenceData: CreatePreferenceRequestDto,
): Promise<Preference> {
  return await prisma.preference.create({
    data: preferenceData,
  });
}

/**
 * Updates the preference.
 * @async
 *
 * @param {UpdatePreferenceRequestDto} updateData - The data to update the preference.
 * @param {string} prefrenceData.theme - The theme preference of the user.
 * @param {string} prefrenceData.language - The language preference of the user.
 * @param {string} prefrenceData.ownerId - The id of the user who owns preference.
 *
 * @returns {Promise<Preference>} A promise that resolves to the updated preference.
 *
 * @throws {AppError} Throws an AppError if the preference is not found
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function updatePreference(updateData: UpdatePreferenceRequestDto) {
  const preference = await prisma.preference.findUnique({
    where: {
      ownerId: updateData.ownerId,
    },
  });

  if (!preference) {
    throw new Error("Preference not found");
  }

  return await prisma.preference.update({
    where: {
      ownerId: updateData.ownerId,
    },
    data: { language: updateData.language, theme: updateData.theme },
  });
}

export const preferencesRepository = {
  getPreferences,
  getPreferenceById,
  getPreferenceByUserId,
  createPreference,
  updatePreference,
};
