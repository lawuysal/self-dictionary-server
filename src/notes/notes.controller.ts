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
import { UpdateNoteRequesSchema } from "./dtos/updateNoteRequest.dto";

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

    const notes = await notesRepository.getNotesByUserId(ownerId);

    res.status(StatusCodes.OK).json(notes);
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

    const [notes, total] = await notesRepository.getNotesByLanguageId(
      languageId,
      Number(limit),
      Number(page),
      sortBy,
      order,
      search,
    );

    const totalPages = Math.ceil(Number(total) / Number(limit));

    if (Number(page) > totalPages && totalPages !== 0) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Notes not found" });
      return;
    }

    res.status(StatusCodes.OK).json({
      notes,
      meta: { total, totalPages },
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

      const parsedBody = UpdateNoteRequesSchema.safeParse(req.body);

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

    res.status(StatusCodes.NO_CONTENT).send();
  }),
);

export const notesController = router;
