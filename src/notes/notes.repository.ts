import { prisma } from "@/prisma/client";
import { CreateNoteRequestDto } from "./dtos/createNoteRequest.dto";
import { UpdateNoteRequestDto } from "./dtos/updateNoteRequest.dto";
import { getRandomInt } from "../utils/getRandomInt";
import { shuffleArray } from "../utils/shuffleArray";
import { QuizQuestion } from "./types/QuizQuestion";
import { CreateNotePropertyRequestDto } from "./dtos/createNotePropertyRequest.dto";
import { UpdateNotePropertyRequestDto } from "./dtos/updateNotePropertyRequest.dto";

async function getNotes() {
  const notes = await prisma.note.findMany();
  return notes;
}

async function getNoteById(id: string) {
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      properties: { orderBy: { createdAt: "asc" } },
      language: {
        select: {
          shadowLanguage: true,
          ownerId: true,
        },
      },
    },
  });
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

async function getRandomQuizQuestionsByIntensity(
  languageId: string,
  intensityType: "low" | "low-medium" | "medium" | "medium-high" | "high",
  limit: number = 10,
): Promise<QuizQuestion[]> {
  let intensityRange: { lte?: number; gt?: number };

  if (intensityType === "low") {
    intensityRange = { lte: 20 };
  } else if (intensityType === "low-medium") {
    intensityRange = { lte: 40, gt: 20 };
  } else if (intensityType === "medium") {
    intensityRange = { lte: 60, gt: 40 };
  } else if (intensityType === "medium-high") {
    intensityRange = { lte: 80, gt: 60 };
  } else {
    intensityRange = { gt: 80 };
  }

  const notesCount = await prisma.note.count({
    where: { languageId, intensity: intensityRange },
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
      where: { languageId, intensity: intensityRange },
      skip: usedRandomInts[0],
    });

    newQuestion.noteId = note1.id;
    newQuestion.noteName = note1.name;
    newQuestion.options = [note1.translation];

    const note2 = await prisma.note.findFirstOrThrow({
      orderBy: { id: "asc" },
      where: { languageId, intensity: intensityRange },
      skip: usedRandomInts[1],
    });

    newQuestion.options.push(note2.translation);

    const note3 = await prisma.note.findFirstOrThrow({
      orderBy: { id: "asc" },
      where: { languageId, intensity: intensityRange },
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

async function getNotePropertyById(notePropertyId: string) {
  const noteProperty = await prisma.noteProperty.findUnique({
    where: { id: notePropertyId },
    include: {
      note: {
        include: {
          language: {
            select: {
              ownerId: true,
            },
          },
        },
      },
    },
  });

  return noteProperty;
}

async function createNoteProperty(
  notePropertyData: CreateNotePropertyRequestDto,
) {
  const noteProperty = await prisma.noteProperty.create({
    data: { ...notePropertyData },
  });

  return noteProperty;
}

async function updateNoteProperty(
  notePropertyData: UpdateNotePropertyRequestDto,
) {
  const noteProperty = await prisma.noteProperty.update({
    where: { id: notePropertyData.notePropertyId },
    data: {
      id: notePropertyData.notePropertyId,
      name: notePropertyData.name,
      value: notePropertyData.value,
      description: notePropertyData.description,
    },
  });

  return noteProperty;
}

async function deleteNotePropertyById(notePropertyId: string) {
  const noteProperty = await prisma.noteProperty.delete({
    where: { id: notePropertyId },
  });

  return noteProperty;
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
  getRandomQuizQuestionsByIntensity,
  decreaseNoteIntensity,
  increaseNoteIntensity,
  getNotePropertyById,
  createNoteProperty,
  updateNoteProperty,
  deleteNotePropertyById,
};
