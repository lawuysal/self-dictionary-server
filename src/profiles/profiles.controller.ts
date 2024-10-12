import { Router, Request } from "express";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import { Roles } from "../roles/enums/roles.enum";
import { profilesRepository } from "./profiles.repository";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/asyncHandler";
import { z } from "zod";
import { ParamsDictionary } from "express-serve-static-core";
import {
  CreateProfileRequestDto,
  CreateProfileRequestSchema,
} from "./dtos/createProfileRequest.dto";
import {
  UpdateProfileRequestDto,
  UpdateProfileRequestSchema,
} from "./dtos/updateProfileRequest.dto";

const router = Router();

const ParamsIdSchema = z.object({
  id: z.string().uuid(),
});

// Get all profiles
// GET: /api/profiles
router.route("/").get(
  authGuard(Roles.ADMIN),
  asyncHandler(async (req, res) => {
    const profiles = await profilesRepository.getProfiles();

    res.status(StatusCodes.OK).json(profiles);
  }),
);

// Get profile by id
// GET: /api/profiles/:id
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
      res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid profile id" });
      return;
    }

    const profileId = parsedParams.data.id;

    const profile = await profilesRepository.getProfileById(profileId);

    // Check if profile exists
    if (!profile) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Profile not found" });
      return;
    }

    // Check if user is admin or owner of the profile
    if (!req.isAdmin && profile.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    res.status(StatusCodes.OK).json(profile);
  }),
);

// Get profile by user id
// GET: /api/profiles/user/:userId
router.route("/user/:userId").get(
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

    const userIdParam = parsedParams.data.id;

    const profile = await profilesRepository.getProfileByUserId(userIdParam);

    // Check if profile exists
    if (!profile) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Profile not found" });
      return;
    }

    // Check if user is admin or owner of the profile
    if (!req.isAdmin && profile.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    res.status(StatusCodes.OK).json(profile);
  }),
);

// Create profile
// POST: /api/profiles
router.route("/").post(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, CreateProfileRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const parsedBody = CreateProfileRequestSchema.safeParse(req.body);

      // Check if request body is valid
      if (!parsedBody.success) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid request ", errorMessage: parsedBody.error });
        return;
      }

      // Check if user is admin or owner of the profile
      if (!req.isAdmin && parsedBody.data.ownerId !== userId) {
        res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
        return;
      }

      const profile = await profilesRepository.createProfile(parsedBody.data);

      res.status(StatusCodes.CREATED).json(profile);
    },
  ),
);

// Update profile
// PUT: /api/profiles/
router.route("/").put(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, UpdateProfileRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const parsedBody = UpdateProfileRequestSchema.safeParse(req.body);

      // Check if request body is valid
      if (!parsedBody.success) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid request ", errorMessage: parsedBody.error });
        return;
      }

      // Check if user is admin or owner of the profile
      if (!req.isAdmin && parsedBody.data.ownerId !== userId) {
        res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
        return;
      }

      const profile = await profilesRepository.createProfile(parsedBody.data);

      res.status(StatusCodes.CREATED).json(profile);
    },
  ),
);

export const profilesController = router;
