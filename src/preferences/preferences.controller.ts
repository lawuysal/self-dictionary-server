import { Request, Router } from "express";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import asyncHandler from "../utils/asyncHandler";
import { Roles } from "../roles/enums/roles.enum";
import { preferencesRepository } from "./preferences.repository";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { ParamsDictionary } from "express-serve-static-core";
import {
  CreatePreferenceRequestDto,
  CreatePreferenceRequestSchema,
} from "./dtos/createPreferenceRequest.dto";
import {
  UpdatePreferenceRequestDto,
  UpdatePreferenceRequestSchema,
} from "./dtos/updatePreferenceRequest.dto";

const ParamsIdSchema = z.object({
  id: z.string().uuid(),
});

const router = Router();

// Get all preferences
// GET: /api/preferences
router.route("/").get(
  authGuard(Roles.ADMIN),
  asyncHandler(async (req, res) => {
    const preferences = await preferencesRepository.getPreferences();

    res.status(StatusCodes.OK).json(preferences);
  }),
);

// Get preference by id
// GET: /api/preferences/:id
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

    // Check if params are in the right type.
    if (!parsedParams.success) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid preference id" });
      return;
    }

    const preferenceId = parsedParams.data.id;

    const preference =
      await preferencesRepository.getPreferenceById(preferenceId);

    // Check if preference exists
    if (!preference) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Preference not found" });
      return;
    }

    // Check if user is admin or the owner of the preference
    if (!req.isAdmin && preference.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    res.status(StatusCodes.OK).json(preference);
  }),
);

// Get preference by user id
// GET: /api/preferences/user/:id
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

    // Check if params are in the right type.
    if (!parsedParams.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid user id" });
      return;
    }

    const preferenceUserId = parsedParams.data.id;

    // Check if user is admin or the owner of the preference
    if (!req.isAdmin && preferenceUserId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    const preference =
      await preferencesRepository.getPreferenceByUserId(preferenceUserId);

    res.status(StatusCodes.OK).json(preference);
  }),
);

// Create preference
// POST: /api/preferences
router.route("/").post(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, CreatePreferenceRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const parsedBody = CreatePreferenceRequestSchema.safeParse(req.body);

      // Check if body is in the right type.
      if (!parsedBody.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: "Invalid preference data",
          errorMessages: parsedBody.error,
        });
        return;
      }

      const preferenceData = parsedBody.data;

      // Check if user is admin or the owner of the preference
      if (!req.isAdmin && preferenceData.ownerId !== userId) {
        res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
        return;
      }

      const preference =
        await preferencesRepository.createPreference(preferenceData);

      res.status(StatusCodes.CREATED).json(preference);
    },
  ),
);

// Update preference
// PUT: /api/preferences
router.route("/").put(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, UpdatePreferenceRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const parsedBody = UpdatePreferenceRequestSchema.safeParse(req.body);

      // Check if body is in the right type.
      if (!parsedBody.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          error: "Invalid preference data",
          errorMessages: parsedBody.error,
        });
        return;
      }

      const preferenceData = parsedBody.data;

      // Check if user is admin or the owner of the preference
      if (!req.isAdmin && preferenceData.ownerId !== userId) {
        res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
        return;
      }

      const preference =
        await preferencesRepository.updatePreference(preferenceData);

      res.status(StatusCodes.OK).json(preference);
    },
  ),
);

export const preferencesController = router;
