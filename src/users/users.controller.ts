import { ParamsDictionary } from "express-serve-static-core";
import { Router, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import asyncHandler from "../utils/asyncHandler";
import { Roles } from "../roles/enums/roles.enum";
import {
  CreateFollowOnUserRequestDto,
  CreateFollowOnUserRequestSchema,
} from "./dtos/createFollowOnUserRequest.dto";
import { usersRepository } from "./users.repository";
import { z } from "zod";

const router = Router();

const ParamsIdSchema = z.object({
  id: z.string().uuid(),
});

// Add follow on user
// POST: /api/users/add-follow
router.route("/add-follow").post(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, CreateFollowOnUserRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      // Check if request body is valid
      const parsedBody = CreateFollowOnUserRequestSchema.parse(req.body);

      // Check if user doing its own request
      if (parsedBody.followedById === parsedBody.followingId) {
        res
          .status(StatusCodes.CONFLICT)
          .json({ error: "User cannot follow itself" });
        return;
      }

      if (!req.isAdmin && userId !== parsedBody.followedById) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const follow = await usersRepository.getFollowOnUserById(parsedBody);

      if (follow) {
        res
          .status(StatusCodes.CONFLICT)
          .json({ error: "Follow already exists" });
        return;
      }

      await usersRepository.createFollowOnUser(parsedBody);

      res.status(StatusCodes.CREATED).json({ followed: true });
    },
  ),
);

// Remove follow on user
// POST: /api/users/remove-follow
router.route("/remove-follow").post(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, CreateFollowOnUserRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      // Check if request body is valid
      const parsedBody = CreateFollowOnUserRequestSchema.parse(req.body);

      if (parsedBody.followedById === parsedBody.followingId) {
        res
          .status(StatusCodes.CONFLICT)
          .json({ error: "User cannot follow itself" });
        return;
      }

      if (!req.isAdmin && userId !== parsedBody.followedById) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const follow = await usersRepository.getFollowOnUserById(parsedBody);

      if (!follow) {
        res
          .status(StatusCodes.CONFLICT)
          .json({ error: "Follow does not exist" });
        return;
      }

      await usersRepository.deleteFollowOnUser(parsedBody);

      res.status(StatusCodes.NO_CONTENT).json({ unfollowed: true });
    },
  ),
);

// Get followers by user id
// GET: /api/users/followers/user/:id
router.route("/followers/user/:id").get(
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

    const requestedUserId = parsedParams.data.id;

    const requestedUser =
      await usersRepository.getUserByUserId(requestedUserId);

    // Check if requested user exists
    if (!requestedUser) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    const followers =
      await usersRepository.getFollowersByUserId(requestedUserId);

    res.status(StatusCodes.OK).json(followers);
  }),
);

// Get followed users by user id
// GET: /api/users/followedUsers/user/:id
router.route("/followedUsers/user/:id").get(
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

    const requestedUserId = parsedParams.data.id;

    const requestedUser =
      await usersRepository.getUserByUserId(requestedUserId);

    // Check if requested user exists
    if (!requestedUser) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
      return;
    }

    const followedUsers =
      await usersRepository.getFollowedUsersByUserId(requestedUserId);

    res.status(StatusCodes.OK).json(followedUsers);
  }),
);

// Check if user is following the another user
// GET: /api/users/is-followed
router.route("/is-followed").post(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, CreateFollowOnUserRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      // Check if request body is valid
      const parsedBody = CreateFollowOnUserRequestSchema.parse(req.body);

      const follow = await usersRepository.getFollowOnUserById(parsedBody);

      res.status(StatusCodes.OK).json({ isFollowed: !!follow });
    },
  ),
);

export const usersController = router;
