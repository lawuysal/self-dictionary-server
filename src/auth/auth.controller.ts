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
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

const router = express.Router();

const client = new RecaptchaEnterpriseServiceClient();

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

    const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY;

    const score = await createAssessment({
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

async function createAssessment({
  projectID = "self-dictionary-org-cloud",
  recaptchaKey,
  token,
  recaptchaAction = "signup",
}: {
  projectID?: string;
  recaptchaKey?: string;
  token?: string;
  recaptchaAction?: string;
}) {
  const projectPath = client.projectPath(projectID);

  // Build the assessment request.
  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  };

  const [response] = await client.createAssessment(request);

  // Check if the token is valid.
  if (!response.tokenProperties || !response.tokenProperties.valid) {
    if (!response.tokenProperties) {
      console.log(
        "The CreateAssessment call failed because the token properties are null or undefined",
      );
      return null;
    }
    console.log(
      `The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`,
    );
    return null;
  }

  // Check if the expected action was executed.
  // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
  if (response.tokenProperties.action === recaptchaAction) {
    // Get the risk score and the reason(s).
    // For more information on interpreting the assessment, see:
    // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
    response.riskAnalysis?.reasons?.forEach((reason) => {
      console.log(reason);
    });

    return response.riskAnalysis?.score;
  } else {
    console.log(
      "The action attribute in your reCAPTCHA tag does not match the action you are expecting to score",
    );
    return null;
  }
}

export const authController = router;
