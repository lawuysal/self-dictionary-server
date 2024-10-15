import express, { Request } from "express";
import { SignupUserDto, SignupUserSchema } from "./dtos/signupUser.dto";
import { LoginUserDto, LoginUserSchema } from "./dtos/loginUser.dto";
import { authRepository } from "./auth.repository";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/asyncHandler";
import { authGuard } from "./middlewares/authGuard.middleware";
import { Roles } from "../roles/enums/roles.enum";
import { profilesRepository } from "../profiles/profiles.repository";

const router = express.Router();

// Login user and return a JWT token
// POST: /api/auth/login
router.route("/login").post(
  asyncHandler(async (req: Request<unknown, unknown, LoginUserDto>, res) => {
    const parsedBody = LoginUserSchema.parse(req.body);

    const result = await authRepository.loginUser(parsedBody);

    if (!result) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid credentials" });
      return;
    }

    const { token, userId } = result;

    let hasProfile = false;
    const profile = await profilesRepository.getProfileByUserId(userId);

    if (profile) {
      hasProfile = true;
    }

    res.json({ token, userId, userEmail: parsedBody.email, hasProfile });
  }),
);

// Signup user and return a JWT token and user id
// POST: /api/auth/signup
router.route("/signup").post(
  asyncHandler(async (req: Request<unknown, unknown, SignupUserDto>, res) => {
    const parsedBody = SignupUserSchema.parse(req.body);

    const { token, userId } = await authRepository.signupUser(parsedBody);

    res.status(StatusCodes.OK).json({
      token,
      userId,
      userEmail: parsedBody.email,
    });
  }),
);

// Return the user id of the user with the given token
// GET: /api/auth/me
router.route("/me").get(authGuard(Roles.USER), (req, res) => {
  res.status(StatusCodes.OK).json({ userId: req.userId });
});

export const authController = router;
