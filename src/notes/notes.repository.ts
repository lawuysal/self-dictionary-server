import { prisma } from "@/prisma/client";
import { CreateNoteRequestDto } from "./dtos/createNoteRequest.dto";
import { UpdateNoteRequestDto } from "./dtos/updateNoteRequest.dto";
import { getRandomInt } from "../utils/getRandomInt";
import { shuffleArray } from "../utils/shuffleArray";
import { QuizQuestion } from "./types/QuizQuestion";

async function getNotes() {
  const notes = await prisma.note.findMany();
  return notes;
}

async function getNoteById(id: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  return note;
}

async function getNotesByUserId(
  userId: string,
  limit: number,
  page: number,
  sortBy: string,
  order: string,
  search: string,
) {
  const skip = (page - 1) * limit;

  // Fetch language IDs associated with the user
  const languageIds = await prisma.language.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  const languageIdArray = languageIds.map((language) => language.id);

  const [notes, total, totalCount] = await prisma.$transaction([
    prisma.note.findMany({
      where: {
        languageId: {
          in: languageIdArray,
        },
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order === "asc" ? "asc" : "desc",
      },
    }),
    prisma.note.count({
      where: {
        languageId: {
          in: languageIdArray,
        },
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      skip,
      take: limit,
    }),
    prisma.note.count({
      where: {
        languageId: {
          in: languageIdArray,
        },
      },
    }),
  ]);

  return [notes, total, totalCount];
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

  const [notes, total, totalCount] = await prisma.$transaction([
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
      skip,
      take: limit,
    }),
    prisma.note.count({
      where: {
        languageId,
      },
    }),
  ]);

  return [notes, total, totalCount];
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
      description: updateData.description,
      isPublic: updateData.isPublic,
    },
  });

  return note;
}

async function deleteNoteById(id: string) {
  const note = await prisma.note.delete({ where: { id } });
  return note;
}

async function getRandomQuizQuestions(
  languageId: string,
  limit: number = 10,
): Promise<QuizQuestion[]> {
  const notesCount = await prisma.note.count({
    where: { languageId },
  });

  const selectedRandomInts: number[] = [];

  while (selectedRandomInts.length < limit) {
    const randomInt = getRandomInt(notesCount);
    if (!selectedRandomInts.includes(randomInt)) {
      selectedRandomInts.push(randomInt);
    }
  }

  const selectedQuestions: QuizQuestion[] = [];

  for (const randomInt of selectedRandomInts) {
    const newQuestion: QuizQuestion = {} as QuizQuestion;
    const usedRandomInts = [randomInt];

    while (usedRandomInts.length < 3) {
      const randomInt = getRandomInt(notesCount);
      if (!usedRandomInts.includes(randomInt)) {
        usedRandomInts.push(randomInt);
      }
    }

    const note1 = await prisma.note.findFirstOrThrow({
      orderBy: { id: "asc" },
      where: { languageId },
      skip: usedRandomInts[0],
    });

    newQuestion.noteId = note1.id;
    newQuestion.noteName = note1.name;
    newQuestion.options = [note1.translation];

    const note2 = await prisma.note.findFirstOrThrow({
      orderBy: { id: "asc" },
      where: { languageId },
      skip: usedRandomInts[1],
    });

    newQuestion.options.push(note2.translation);

    const note3 = await prisma.note.findFirstOrThrow({
      orderBy: { id: "asc" },
      where: { languageId },
      skip: usedRandomInts[2],
    });

    newQuestion.options.push(note3.translation);

    newQuestion.options = shuffleArray(newQuestion.options);

    selectedQuestions.push(newQuestion);
  }

  return selectedQuestions;
}

async function decreaseNoteIntensity(noteId: string, amount: number) {
  const note = await prisma.note.update({
    where: { id: noteId },
    data: { intensity: { decrement: amount } },
  });

  return note;
}

async function increaseNoteIntensity(noteId: string, amount: number) {
  const note = await prisma.note.update({
    where: { id: noteId },
    data: { intensity: { increment: amount } },
  });

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
  getRandomQuizQuestions,
  decreaseNoteIntensity,
  increaseNoteIntensity,
};
