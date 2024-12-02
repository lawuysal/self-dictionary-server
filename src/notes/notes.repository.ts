import { prisma } from "@/prisma/client";
import { CreateNoteRequestDto } from "./dtos/createNoteRequest.dto";
import { UpdateNoteRequestDto } from "./dtos/updateNoteRequest.dto";

async function getNotes() {
  const notes = await prisma.note.findMany();
  return notes;
}

async function getNoteById(id: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  return note;
}

async function getNotesByUserId(userId: string) {
  const languageIds = await prisma.language.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  const notes = await prisma.note.findMany({
    where: {
      languageId: {
        in: languageIds.map((language) => language.id),
      },
    },
  });

  return notes;
}

async function getNotesByLanguageId(
  languageId: string,
  limit: number,
  page: number,
  sortBy: string,
  order: string,
  search: string,
) {
  const skip = (page - 1) * limit;

  const [notes, total] = await prisma.$transaction([
    prisma.note.findMany({
      where: {
        languageId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: order === "asc" ? "asc" : "desc" },
    }),
    prisma.note.count({
      where: {
        languageId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    }),
  ]);

  return [notes, total];
}

async function createNote(noteData: CreateNoteRequestDto, languageId: string) {
  const data = { ...noteData, languageId };
  const note = await prisma.note.create({ data });

  return note;
}

async function updateNote(id: string, updateData: UpdateNoteRequestDto) {
  const note = await prisma.note.update({
    where: { id },
    data: {
      name: updateData.name,
      translation: updateData.translation,
    },
  });

  return note;
}

async function deleteNoteById(id: string) {
  const note = await prisma.note.delete({ where: { id } });
  return note;
}

export const notesRepository = {
  getNotes,
  getNoteById,
  getNotesByUserId,
  getNotesByLanguageId,
  createNote,
  updateNote,
  deleteNoteById,
};
