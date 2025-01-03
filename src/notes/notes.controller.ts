import { Request, Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { notesRepository } from "./notes.repository";
import { StatusCodes } from "http-status-codes";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import { Roles } from "../roles/enums/roles.enum";
import { z } from "zod";
import { languagesRepository } from "../languages/languages.repository";
import {
  CreateNoteRequesSchema,
  CreateNoteRequestDto,
} from "./dtos/createNoteRequest.dto";
import { ParamsDictionary } from "express-serve-static-core";
import { UpdateLanguageRequestDto } from "../languages/dtos/updateLanguageRequest.dto";
import { UpdateNoteRequestSchema } from "./dtos/updateNoteRequest.dto";
import { CreateNotePropertyRequestSchema } from "./dtos/createNotePropertyRequest.dto";
import { UpdateNotePropertyRequestSchema } from "./dtos/updateNotePropertyRequest.dto";

const router = Router();

const ParamsIdSchema = z.object({
  id: z.string().uuid(),
});

const QueryParamsSchema = z.object({
  sortBy: z.string().optional().default("createdAt"),
  order: z.string().optional().default("asc"),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional().default(""),
});

// Get all notes
// GET: /api/notes
router.route("/").get(
  authGuard(Roles.ADMIN),
  asyncHandler(async (req, res) => {
    const notes = await notesRepository.getNotes();

    res.status(StatusCodes.OK).json(notes);
  }),
);

// Get note by id
// GET: /api/notes/:id
router.route("/:id").get(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const parsedParams = ParamsIdSchema.safeParse(req.params);

    // Check if id is valid
    if (!parsedParams.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid id" });
      return;
    }

    const noteId = parsedParams.data.id;

    const note = await notesRepository.getNoteById(noteId);

    // Check if note exists
    if (!note) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Note not found" });
      return;
    }

    const language = await languagesRepository.getLanguageById(note.languageId);

    // Check if language exists
    if (!language) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Language not found" });
      return;
    }

    // Check if user is admin or owner of the note
    if (!req.isAdmin && language.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    res.status(StatusCodes.OK).json(note);
  }),
);

// Get notes by user id
// GET: /api/notes/user/:id
router.route("/user/:id").get(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const parsedParams = ParamsIdSchema.safeParse(req.params);

    // Check if id is valid
    if (!parsedParams.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid user id" });
      return;
    }

    const ownerId = parsedParams.data.id;

    // Check if user is admin or owner of the notes
    if (!req.isAdmin && ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    const parsedQuery = QueryParamsSchema.safeParse(req.query);

    if (!parsedQuery.success) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid query params" });
      return;
    }

    const { sortBy, order, page, limit, search } = parsedQuery.data;

    if (Number(page) < 1 || Number(limit) < 1) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid query params" });
    }

    const [notes, total, totalCount] = await notesRepository.getNotesByUserId(
      ownerId,
      Number(limit),
      Number(page),
      sortBy,
      order,
      search,
    );

    const totalPages = Math.ceil(Number(totalCount) / Number(limit));

    if (Number(page) > totalPages && totalPages !== 0) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Notes not found" });
      return;
    }

    res.status(StatusCodes.OK).json({
      notes,
      meta: { total, totalPages, totalCount },
    });
  }),
);

// Get notes by language id
// GET: /api/notes/language/:id
router.route("/language/:id").get(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const parsedParams = ParamsIdSchema.safeParse(req.params);

    // Check if id is valid
    if (!parsedParams.success) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid language id" });
      return;
    }

    const languageId = parsedParams.data.id;

    const language = await languagesRepository.getLanguageById(languageId);

    // Check if language exists
    if (!language) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Language not found" });
      return;
    }

    // Check if user is admin or owner of the language
    if (!req.isAdmin && language.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    const parsedQuery = QueryParamsSchema.safeParse(req.query);

    if (!parsedQuery.success) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid query params" });
      return;
    }

    const { sortBy, order, page, limit, search } = parsedQuery.data;

    if (Number(page) < 1 || Number(limit) < 1) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid query params" });
    }

    const [notes, total, totalCount] =
      await notesRepository.getNotesByLanguageId(
        languageId,
        Number(limit),
        Number(page),
        sortBy,
        order,
        search,
      );

    const totalPages = Math.ceil(Number(totalCount) / Number(limit));

    if (Number(page) > totalPages && totalPages !== 0) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Notes not found" });
      return;
    }

    res.status(StatusCodes.OK).json({
      notes,
      meta: { total, totalPages, totalCount },
    });
  }),
);

// Create note
// POST: /api/notes
router.route("/").post(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, CreateNoteRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const parsedBody = CreateNoteRequesSchema.safeParse(req.body);

      // Check if body is valid
      if (!parsedBody.success) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid body" });
        return;
      }

      const noteData = parsedBody.data;

      const language = await languagesRepository.getLanguageById(
        noteData.languageId,
      );

      // Check if language exists
      if (!language) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Language not found" });
        return;
      }

      // Check if user is admin or owner of the language
      if (!req.isAdmin && language.ownerId !== userId) {
        res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
        return;
      }

      const note = await notesRepository.createNote(
        noteData,
        noteData.languageId,
      );

      res.status(StatusCodes.CREATED).json(note);
    },
  ),
);

// Update note
// PUT: /api/notes/:id
router.route("/:id").put(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, UpdateLanguageRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const parsedParams = ParamsIdSchema.safeParse(req.params);

      // Check if id is valid
      if (!parsedParams.success) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid note id" });
        return;
      }

      const noteId = parsedParams.data.id;

      const note = await notesRepository.getNoteById(noteId);

      // Check if note exists
      if (!note) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Note not found" });
        return;
      }

      const language = await languagesRepository.getLanguageById(
        note.languageId,
      );

      // Check if language exists
      if (!language) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Language not found" });
        return;
      }

      // Check if user is admin or owner of the note
      if (!req.isAdmin && language.ownerId !== userId) {
        res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
        return;
      }

      const parsedBody = UpdateNoteRequestSchema.safeParse(req.body);

      console.log(req.body);
      console.log(parsedBody.error);

      // Check if body is valid
      if (!parsedBody.success) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid body" });
        return;
      }

      const noteData = parsedBody.data;

      const updatedNote = await notesRepository.updateNote(noteId, noteData);

      res.status(StatusCodes.OK).json(updatedNote);
    },
  ),
);

// Delete note
// DELETE: /api/notes/:id
router.route("/:id").delete(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const parsedParams = ParamsIdSchema.safeParse(req.params);

    // Check if id is valid
    if (!parsedParams.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid note id" });
      return;
    }

    const noteId = parsedParams.data.id;

    const note = await notesRepository.getNoteById(noteId);

    // Check if note exists
    if (!note) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Note not found" });
      return;
    }

    const language = await languagesRepository.getLanguageById(note.languageId);

    // Check if language exists
    if (!language) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Language not found" });
      return;
    }

    // Check if user is admin or owner of the note
    if (!req.isAdmin && language.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    await notesRepository.deleteNoteById(noteId);

    res.status(StatusCodes.OK).json({ message: "Note deleted" });
  }),
);

// Get random quiz notes
// POST: /api/notes/quiz/language/:id
router.route("/quiz/language/:id").post(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const parsedParams = ParamsIdSchema.safeParse(req.params);

    // Check if id is valid
    if (!parsedParams.success) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid language id" });
      return;
    }

    const languageId = parsedParams.data.id;

    const language = await languagesRepository.getLanguageById(languageId);

    // Check if language exists
    if (!language) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Language not found" });
      return;
    }

    // Check if user is admin or owner of the language
    if (!req.isAdmin && language.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    if (!req.body.type) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid note type" });
      return;
    }

    let quizQuestions;

    if (req.body.type === "all") {
      quizQuestions = await notesRepository.getRandomQuizQuestions(languageId);
    } else {
      quizQuestions = await notesRepository.getRandomQuizQuestionsByIntensity(
        languageId,
        req.body.type,
      );
    }

    res.status(StatusCodes.OK).json({
      quizQuestions,
    });
  }),
);

// Get quiz question answer
// POST: /api/notes/quiz/question/answer/:id
router.route("/quiz/question/answer/:id").post(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const parsedParams = ParamsIdSchema.safeParse(req.params);

    // Check if id is valid
    if (!parsedParams.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid note id" });
      return;
    }

    const noteId = parsedParams.data.id;

    const note = await notesRepository.getNoteById(noteId);

    // Check if note exists
    if (!note) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Note not found" });
      return;
    }

    const language = await languagesRepository.getLanguageById(note.languageId);

    // Check if language exists
    if (!language) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Language not found" });
      return;
    }

    // Check if user is admin or owner of the note
    if (!req.isAdmin && language.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    const answerResponse = {
      answer: note.translation,
      isCorrect: false,
    };

    if (req.body.answer === note.translation) {
      answerResponse.isCorrect = true;
      if (note.intensity !== 100 && note.intensity < 100) {
        await notesRepository.increaseNoteIntensity(noteId, 1);
      }
    }

    if (req.body.answer !== note.translation) {
      if (note.intensity !== 0 && note.intensity > 0) {
        await notesRepository.decreaseNoteIntensity(noteId, 1);
      }
    }

    res.status(StatusCodes.OK).json(answerResponse);
  }),
);

// Create note property
// POST: /api/notes/create/note-property
router.route("/create/note-property").post(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const parsedBody = CreateNotePropertyRequestSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid body" });
      return;
    }

    const note = await notesRepository.getNoteById(parsedBody.data.noteId);

    if (!note) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Note not found" });
      return;
    }

    if (!req.isAdmin && note.language.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    const noteProperty = await notesRepository.createNoteProperty(
      parsedBody.data,
    );

    res.status(StatusCodes.CREATED).json(noteProperty);
  }),
);

// Update note property
// PUT: /api/notes/create/note-property
router.route("/update/note-property").put(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const parsedBody = UpdateNotePropertyRequestSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid body" });
      return;
    }

    const noteProperty = await notesRepository.getNotePropertyById(
      parsedBody.data.notePropertyId,
    );

    if (!noteProperty) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Note not found" });
      return;
    }

    if (!req.isAdmin && noteProperty.note.language.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    const updatedNoteProperty = await notesRepository.updateNoteProperty(
      parsedBody.data,
    );

    res.status(StatusCodes.CREATED).json(updatedNoteProperty);
  }),
);

// Delete note property
// DELETE: /api/notes/delete/note-property/:id
router.route("/delete/note-property/:id").delete(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const parsedParams = ParamsIdSchema.safeParse(req.params);

    if (!parsedParams.success) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid note property id" });
      return;
    }

    const notePropertyId = parsedParams.data.id;

    const noteProperty =
      await notesRepository.getNotePropertyById(notePropertyId);

    if (!noteProperty) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Note property not found" });
      return;
    }

    if (!req.isAdmin && noteProperty.note.language.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    const deletedNoteProperty =
      await notesRepository.deleteNotePropertyById(notePropertyId);

    res.status(StatusCodes.OK).json({ deletedNoteProperty });
  }),
);

export const notesController = router;
