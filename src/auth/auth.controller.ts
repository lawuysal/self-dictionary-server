import express, { Request } from "express";
import { SignupUserDto, SignupUserSchema } from "./dtos/signupUser.dto";
import { LoginUserDto, LoginUserSchema } from "./dtos/loginUser.dto";
import authRepository from "./auth.repository";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/asyncHandler";

const router = express.Router();

// Signup user and return a JWT token and user id
// POST: /api/auth/signup
router.route("/signup").post(
  asyncHandler(async (req: Request<unknown, unknown, SignupUserDto>, res) => {
    const parsedBody = SignupUserSchema.parse(req.body);

    const { token, userId } = await authRepository.signupUser(parsedBody);

    res.json({ token, userId });
  }),
);

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

    res.json({ token, userId });
  }),
);

export default router;
