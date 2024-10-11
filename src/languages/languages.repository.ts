import { prisma } from "@/prisma/client";
import { CreateLanguageRequestDto } from "./dtos/createLanguageRequest.dto";
import { UpdateLanguageRequestDto } from "./dtos/updateLanguageRequest.dto";
import { Language } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../middlewares/globalErrorMiddleware";

/**
 * Gets all languages.
 * @async
 *
 * @returns {Promise<Language[]>} A promise that resolves to an array of languages.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function getLanguages(): Promise<Language[]> {
  const languages = await prisma.language.findMany();

  return languages;
}

/**
 * Gets a language by id.
 * @async
 *
 * @param {string} id - The id of the language to get.
 *
 * @returns {Promise<Language | null>} A promise that resolves to the language if found, otherwise null.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function getLanguageById(id: string): Promise<Language | null> {
  const language = await prisma.language.findUnique({ where: { id } });

  return language;
}

/**
 * Gets all languages of a user by user id.
 * @async
 *
 * @param {string} userId - The id of the user to get languages for.
 *
 * @returns {Promise<Language[]>} A promise that resolves to an array of languages.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function getLanguagesByUserId(userId: string): Promise<Language[]> {
  const languages = await prisma.language.findMany({
    where: { ownerId: userId },
  });

  return languages;
}

/**
 * Creates a new language.
 * @async
 *
 * @param {CreateLanguageRequestDto} languageData - The data to create the language.
 * @param {string} userId - The id of the user creating the language.
 *
 * @returns {Promise<Language>} A promise that resolves to the created language.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function createLanguage(
  languageData: CreateLanguageRequestDto,
  userId: string,
): Promise<Language> {
  const data = { ...languageData, ownerId: userId };
  const language = await prisma.language.create({ data });

  return language;
}

/**
 * Updates a language.
 * @async
 *
 * @param {string} id - The id of the language to update.
 * @param {UpdateLanguageRequestDto} updateData - The data to update the language.
 *
 * @returns {Promise<Language>} A promise that resolves to the updated language.
 *
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function updateLanguage(
  id: string,
  updateData: UpdateLanguageRequestDto,
): Promise<Language> {
  const language = await prisma.language.update({
    where: { id },
    data: {
      name: updateData.name,
      description: updateData.description,
    },
  });

  return language;
}

/**
 * Deletes a language.
 * Checks if the language has notes before deleting.
 * @async
 *
 * @param {string} id - The id of the language to delete.
 *
 * @returns {Promise<Language>} A promise that resolves to the deleted language.
 *
 * @throws {AppError} Throws an AppError (HTTP 409) if the language has notes.
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function deleteLanguage(id: string): Promise<Language> {
  const language = await prisma.language.findUnique({ where: { id } });

  if (!language) {
    throw new Error("Language not found");
  }

  const notes = await prisma.note.findMany({ where: { languageId: id } });

  if (notes.length > 0) {
    throw new AppError(
      "Cannot delete language with notes",
      StatusCodes.CONFLICT,
    );
  }

  const deletedLanguage = await prisma.language.delete({ where: { id } });

  return deletedLanguage;
}

export const languagesRepository = {
  getLanguages,
  getLanguageById,
  getLanguagesByUserId,
  createLanguage,
  updateLanguage,
  deleteLanguage,
};
