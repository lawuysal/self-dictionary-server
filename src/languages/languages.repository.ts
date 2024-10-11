import { prisma } from "@/prisma/client";
import { CreateLanguageRequestDto } from "./dtos/createLanguageRequest.dto";
import { UpdateLanguageRequestDto } from "./dtos/updateLanguageRequest.dto";

async function getLanguages() {
  const languages = await prisma.language.findMany();

  return languages;
}

async function getLanguageById(id: string) {
  const language = await prisma.language.findUnique({ where: { id } });

  return language;
}

async function getLanguagesByUserId(userId: string) {
  const languages = await prisma.language.findMany({
    where: { ownerId: userId },
  });

  return languages;
}

async function createLanguage(
  languageData: CreateLanguageRequestDto,
  userId: string,
) {
  const data = { ...languageData, ownerId: userId };
  const language = await prisma.language.create({ data });

  return language;
}

async function updateLanguage(
  id: string,
  updateData: UpdateLanguageRequestDto,
) {
  const language = await prisma.language.update({
    where: { id },
    data: {
      name: updateData.name,
      description: updateData.description,
    },
  });

  return language;
}

async function deleteLanguage(id: string) {
  const language = await prisma.language.delete({ where: { id } });

  return language;
}

export const languagesRepository = {
  getLanguages,
  getLanguageById,
  getLanguagesByUserId,
  createLanguage,
  updateLanguage,
  deleteLanguage,
};
