import express, { Request } from "express";
import { SignupUserDto, SignupUserSchema } from "./dtos/signupUser.dto";
import { LoginUserDto, LoginUserSchema } from "./dtos/loginUser.dto";
import { authRepository } from "./auth.repository";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/asyncHandler";
import { authGuard } from "./middlewares/authGuard.middleware";
import { Roles } from "../roles/enums/roles.enum";
import { profilesRepository } from "../profiles/profiles.repository";
import { sendEmailVerification } from "../emails/sendEmailVerification";
import rateLimit from "express-rate-limit";

const router = express.Router();

const verifyEmaiLimiter = rateLimit({
  identifier: (req: Request) => req.ip!,
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// Login user and return a JWT token
// POST: /api/auth/login
router.route("/login").post(
  asyncHandler(async (req: Request<unknown, unknown, LoginUserDto>, res) => {
    const parsedBody = LoginUserSchema.parse(req.body);

    const result = await authRepository.loginUser(parsedBody);

    if (!result) {
      res
        .status(StatusCodes.BAD_REQUEST)
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
    const parsedBody = SignupUserSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: parsedBody.error,
      });
      return;
    }

    const { emailVerificationToken } = await authRepository.signupUser(
      parsedBody.data,
    );

    await sendEmailVerification({
      to: parsedBody.data.email,
      subject: "Verifiy Your Email Address - Self Dictionary",
      text: `Hi ${parsedBody.data.email}, thanks for signing up with Self Dictionary! Please click the following link to verify your email address: ${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`,
    });

    res.status(StatusCodes.OK).json({ message: "User created successfully" });
  }),
);

// Return the user id of the user with the given token
// GET: /api/auth/me
router.route("/me").get(authGuard(Roles.USER), (req, res) => {
  res.status(StatusCodes.OK).json({ userId: req.userId });
});

// Verify the email of the user with the given token
// GET: /api/auth/verify-email/:token
router.route("/verify-email/:token").get(
  verifyEmaiLimiter,
  asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await authRepository.verifyEmail(token);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Invalid token" });
      return;
    }

    res.status(StatusCodes.OK).json({ message: "Email verified" });
  }),
);

export const authController = router;
