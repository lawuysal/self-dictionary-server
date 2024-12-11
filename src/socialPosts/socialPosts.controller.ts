import { ParamsDictionary } from "express-serve-static-core";
import { Router, Request } from "express";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import asyncHandler from "../utils/asyncHandler";
import { Roles } from "../roles/enums/roles.enum";
import { StatusCodes } from "http-status-codes";
import { socialPostsRepository } from "./socialPosts.repository";
import {
  CreateSocialPostRequestDto,
  CreateSocialPostRequestSchema,
} from "./dtos/createSocialPostRequest.dto";
import { z } from "zod";
import {
  CreatePositiveActionToPostRequestDto,
  CreatePositiveActionToPostRequestSchema,
} from "./dtos/createPositiveActionToPostRequest.dto";
import { PostType } from "./enum/postType";

const router = Router();

const ParamsIdSchema = z.object({
  id: z.string().uuid(),
});

// Get all social posts
// GET: /api/social-posts
router.route("/").get(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    let socialPosts;
    const username = req.query.username as string;

    if (PostType.POSITIVE_ACTIONED_POSTS === req.query.type) {
      socialPosts = await socialPostsRepository.getPositiveActionedSocialPosts(
        userId,
        Number(req.query.page),
      );
    } else if (PostType.MY_POSTS === req.query.type) {
      socialPosts = await socialPostsRepository.getMySocialPosts(
        userId,
        Number(req.query.page),
      );
    } else if (PostType.MY_FOLLOWINGS === req.query.type) {
      socialPosts = await socialPostsRepository.getMyFollowedUsersSocialPosts(
        userId,
        Number(req.query.page),
      );
    } else if (PostType.USERS_POSTS === req.query.type) {
      socialPosts = await socialPostsRepository.getUserSocialPostsByUsername(
        username,
        Number(req.query.page),
      );
    } else {
      socialPosts = await socialPostsRepository.getLatestSocialPosts(
        Number(req.query.page),
      );
    }

    res.status(StatusCodes.OK).json(socialPosts);
  }),
);

// Get social post by id
// GET: /api/social-posts/:id
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
        .json({ error: "Invalid social post id" });
      return;
    }

    const socialPostId = parsedParams.data.id;

    const socialPost =
      await socialPostsRepository.getSocialPostById(socialPostId);

    // Check if language exists
    if (!socialPost) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Social post not found" });
      return;
    }

    // Check if user is admin or owner of the language
    // if (!req.isAdmin && socialPost.ownerId !== userId) {
    //   res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
    //   return;
    // }

    res.status(StatusCodes.OK).json(socialPost);
  }),
);

// Create social post
// POST: /api/social-posts
router.route("/").post(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<ParamsDictionary, unknown, CreateSocialPostRequestDto>,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      // Check if request body is valid
      const parsedBody = CreateSocialPostRequestSchema.parse(req.body);

      // Check if user is admin or owner of the account
      if (!req.isAdmin && parsedBody.ownerId !== userId) {
        res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
        return;
      }

      const socialPost =
        await socialPostsRepository.createSocialPost(parsedBody);

      res.status(StatusCodes.CREATED).json(socialPost);
    },
  ),
);

// Delete social post by id
// DELETE: /api/social-posts/:id
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

    // Check if params are in the right type
    if (!parsedParams.success) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid social post id" });
      return;
    }

    const socialPostId = parsedParams.data.id;

    const socialPost =
      await socialPostsRepository.getSocialPostById(socialPostId);

    // Check if language exists
    if (!socialPost) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Social post not found" });
      return;
    }

    // Check if user is admin or owner of the language
    if (!req.isAdmin && socialPost.owner.ownerId !== userId) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    await socialPostsRepository.deleteSocialPostById(socialPostId);

    res.status(StatusCodes.OK).json({ socialPost });
  }),
);

// Add positive action to a post
// POST: /api/social-posts/add-positive-action
router.route("/add-positive-action").post(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<
        ParamsDictionary,
        unknown,
        CreatePositiveActionToPostRequestDto
      >,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      // Check if request body is valid
      const parsedBody = CreatePositiveActionToPostRequestSchema.parse(
        req.body,
      );

      if (!req.isAdmin && userId !== parsedBody.userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const positiveAction =
        await socialPostsRepository.getPositiveActionById(parsedBody);

      if (positiveAction) {
        res
          .status(StatusCodes.CONFLICT)
          .json({ error: "Positive action already exists" });
        return;
      }

      const socialPost =
        await socialPostsRepository.createPositiveActionOnPostById(parsedBody);

      res.status(StatusCodes.CREATED).json(socialPost);
    },
  ),
);

// Delete positive action on a post
// POST: /api/social-posts/remove-positive-action
router.route("/remove-positive-action").post(
  authGuard(Roles.USER),
  asyncHandler(
    async (
      req: Request<
        ParamsDictionary,
        unknown,
        CreatePositiveActionToPostRequestDto
      >,
      res,
    ) => {
      const userId = req.userId;

      // Check if user is authenticated
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      // Check if request body is valid
      const parsedBody = CreatePositiveActionToPostRequestSchema.parse(
        req.body,
      );

      if (!req.isAdmin && userId !== parsedBody.userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const positiveAction =
        await socialPostsRepository.getPositiveActionById(parsedBody);

      if (!positiveAction) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Positive action can't found" });
        return;
      }

      const socialPost =
        await socialPostsRepository.deletePositiveActionOnPostById(parsedBody);

      res.status(StatusCodes.CREATED).json(socialPost);
    },
  ),
);

export const socialPostsController = router;
