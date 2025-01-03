import express, { Request } from "express";
import { SignupUserDto, SignupUserSchema } from "./dtos/signupUser.dto";
import { LoginUserDto, LoginUserSchema } from "./dtos/loginUser.dto";
import { authRepository } from "./auth.repository";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/asyncHandler";
import { authGuard } from "./middlewares/authGuard.middleware";
import { Roles } from "../roles/enums/roles.enum";
import { profilesRepository } from "../profiles/profiles.repository";
import { sendEmail } from "../emails/sendEmail";
import rateLimit from "express-rate-limit";
import { createCaptchaAssessment } from "../utils/createCaptchaAssessment";
import { z } from "zod";

const router = express.Router();

const verifyEmailLimiter = rateLimit({
  identifier: (req: Request) => req.ip!,
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const signupLimiter = rateLimit({
  identifier: (req: Request) => req.ip!,
  windowMs: 60 * 60 * 1000,
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

// Signup user
// POST: /api/auth/signup
router.route("/signup").post(
  signupLimiter,
  asyncHandler(async (req: Request<unknown, unknown, SignupUserDto>, res) => {
    const parsedBody = SignupUserSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: parsedBody.error,
      });
      return;
    }

    const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY;

    const score = await createCaptchaAssessment({
      recaptchaKey: recaptchaSiteKey,
      token: parsedBody.data.captchaToken,
    });

    if (!score) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid captcha token",
      });
      return;
    }

    const { emailVerificationToken } = await authRepository.signupUser(
      parsedBody.data,
    );

    await sendEmail({
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
  verifyEmailLimiter,
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

// Send password reset email to the user with the given email
// POST: /api/auth/forgot-password
router.route("/forgot-password").post(
  asyncHandler(async (req, res) => {
    const requestBodySchema = z.object({
      email: z.string().email(),
      captchaToken: z.string(),
    });

    const parsedBody = requestBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: parsedBody.error,
      });
      return;
    }

    const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY;

    const score = await createCaptchaAssessment({
      recaptchaKey: recaptchaSiteKey,
      token: parsedBody.data.captchaToken,
    });

    if (!score || score < 0.3) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid captcha token",
      });
      return;
    }

    const user = await authRepository.forgotPassword(parsedBody.data.email);

    if (!user) {
      res.status(StatusCodes.OK).json({ error: "Password reset email sent" });
      return;
    }

    await sendEmail({
      to: parsedBody.data.email,
      subject: "Reset Your Password - Self Dictionary",
      text: `Hi ${parsedBody.data.email}, please click the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${user.passwordResetToken}`,
    });

    res.status(StatusCodes.OK).json({ message: "Password reset email sent" });
  }),
);

// Check if the password reset token is valid
// GET: /api/auth/reset-password/:token
router.route("/reset-password/:token").get(
  asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await authRepository.checkPasswordResetToken(token);

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Invalid token" });
      return;
    }

    res.status(StatusCodes.OK).json({ message: "Valid token" });
  }),
);

// Reset the password of the user with the given token
// POST: /api/auth/reset-password/:token
router.route("/reset-password/:token").post(
  asyncHandler(async (req, res) => {
    const { token } = req.params;

    const requestBodySchema = z.object({
      password: z.string().min(8),
      passwordConfirmation: z.string().min(8),
      captchaToken: z.string(),
    });

    const parsedBody = requestBodySchema.safeParse(req.body);

    if (
      !parsedBody.success ||
      parsedBody.data.password !== parsedBody.data.passwordConfirmation
    ) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Passwords do not match or are less than 8 characters",
      });
      return;
    }

    const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY;

    const score = await createCaptchaAssessment({
      recaptchaKey: recaptchaSiteKey,
      token: parsedBody.data.captchaToken,
    });

    if (!score || score < 0.3) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid captcha token",
      });
      return;
    }

    const user = await authRepository.resetPassword(
      token,
      parsedBody.data.password,
    );

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Invalid token" });
      return;
    }

    res.status(StatusCodes.OK).json({ message: "Password reset" });
  }),
);

export const authController = router;
