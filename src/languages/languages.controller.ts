import { ParamsDictionary } from "express-serve-static-core";
import { Router, Request } from "express";
import asyncHandler from "../utils/asyncHandler";
import { languagesRepository } from "./languages.repository";
import { StatusCodes } from "http-status-codes";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import { Roles } from "../roles/enums/roles.enum";
import {
  CreateLanguageRequestDto,
  CreateLanguageRequestSchema,
} from "./dtos/createLanguageRequest.dto";
import {
  UpdateLanguageRequestDto,
  UpdateLanguageRequestSchema,
} from "./dtos/updateLanguageRequest.dto";
import { z } from "zod";
import { SupportedTTSLanguagesEnum } from "../tts/enums/supportedTTSLanguages.enum";

const router = Router();

const ParamsIdSchema = z.object({
  id: z.string().uuid(),
});

// Get all languages
// GET: /api/languages
router.route("/").get(
  authGuard(Roles.ADMIN),
  asyncHandler(async (req, res) => {
    const languages = await languagesRepository.getLanguages();

    res.status(StatusCodes.OK).json(languages);
  }),
);

// Get language by id
// GET: /api/languages/:id
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

    // Check if params are in the right type
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

    res.status(StatusCodes.OK).json(language);
  }),
);

// Get languages by user id
// GET: /api/languages/user/:id
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

    // Check if params are in the right type
    if (!parsedParams.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid user id" });
      return;
    }

    const requestedUserId = parsedParams.data.id;

    // Check if user is admin or owner of the language
    if (!req.isAdmin && requestedUserId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    const languages = await languagesRepository.getLanguagesByUserId(userId);

    res.status(StatusCodes.OK).json(languages);
  }),
);

// Create language
// POST: /api/languages
router.route("/").post(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, CreateLanguageRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      // Check if request body is valid
      const parsedBody = CreateLanguageRequestSchema.parse(req.body);

      // Check if user is admin or owner of the account
      if (!req.isAdmin && parsedBody.ownerId !== userId) {
        res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
        return;
      }

      const language = await languagesRepository.createLanguage(
        parsedBody,
        userId,
      );

      res.status(StatusCodes.CREATED).json(language);
    },
  ),
);

// Update language
// PUT: /api/languages/:id
router.route("/:id").put(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, UpdateLanguageRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if params are in the right type.
      const parsedParams = ParamsIdSchema.safeParse(req.params);

      if (!parsedParams.success) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid language id" });
        return;
      }

      const languageId = parsedParams.data.id;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      // Check if request body is valid
      const parsedBody = UpdateLanguageRequestSchema.parse(req.body);

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

      const updatedLanguage = await languagesRepository.updateLanguage(
        languageId,
        parsedBody,
      );

      res.status(StatusCodes.OK).json(updatedLanguage);
    },
  ),
);

// Delete language
// DELETE: /api/languages/:id
router.route("/:id").delete(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if params are in the right type.
    const parsedParams = ParamsIdSchema.safeParse(req.params);

    if (!parsedParams.success) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid language id" });
      return;
    }

    const languageId = parsedParams.data.id;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

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

    await languagesRepository.deleteLanguage(languageId);

    res.status(StatusCodes.OK).json({ message: "Language deleted" });
  }),
);

// Get language note counts
// GET: /api/languages/note-counts/:id/
router.route("/note-counts/:id").get(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if params are in the right type.
    const parsedParams = ParamsIdSchema.safeParse(req.params);

    if (!parsedParams.success) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid language id" });
      return;
    }

    const languageId = parsedParams.data.id;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

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

    const noteCounts =
      await languagesRepository.getLanguageNoteCounts(languageId);

    res.status(StatusCodes.OK).json(noteCounts);
  }),
);

// Get all shadow languages
// GET: /api/languages/shadow-languages/get
router.route("/shadow-languages/get").get(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const shadowLanguages = Object.values(SupportedTTSLanguagesEnum).map(
      (language) => ({
        language,
        value: language,
      }),
    );
    res.status(StatusCodes.OK).json(shadowLanguages);
  }),
);

export const languagesController = router;
