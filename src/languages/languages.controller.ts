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

    const language = await languagesRepository.getLanguageById(req.params.id);

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
// GET: /api/languages/user/:userId
router.route("/user/:userId").get(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    // Check if user is admin or owner of the language
    if (!req.isAdmin && req.params.userId !== userId) {
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

    res.status(StatusCodes.NO_CONTENT).send();
  }),
);

export const languagesController = router;
