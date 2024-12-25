import express, { Request } from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import { authController } from "./auth/auth.controller";
import { rolesController } from "./roles/roles.controller";
import { languagesController } from "./languages/languages.controller";
import { globalErrorHandler } from "./middlewares/globalErrorMiddleware";
import { profilesController } from "./profiles/profiles.controller";
import { preferencesController } from "./preferences/preferences.controller";
import { notesController } from "./notes/notes.controller";
import path from "path";
import { socialPostsController } from "./socialPosts/socialPosts.controller";
import { usersController } from "./users/users.controller";
import { dictionaryApiController } from "./dictionaryApi/dictionaryApi.controller";
import { ttsController } from "./tts/tts.controller";
import { generativeAIController } from "./generativeAI/generativeAI.controller";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

const app = express();

const limiterMinutely = rateLimit({
  identifier: (req: Request) => req.ip!,
  windowMs: 1 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const limiterHourly = rateLimit({
  identifier: (req: Request) => req.ip!,
  windowMs: 5 * 60 * 1000,
  limit: 10000,
  standardHeaders: true,
  legacyHeaders: false,
});

const slower = slowDown({
  identifier: (req: Request) => req.ip!,
  windowMs: 15 * 60 * 1000,
  delayAfter: 100,
  delayMs: () => 300,
});

app.use(limiterMinutely);
app.use(limiterHourly);
app.use(slower);

// using morgan for logs
app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use("/public", express.static(path.join(__dirname, "../public")));

app.use("/api/users", usersController);
app.use("/api/auth", authController);
app.use("/api/roles", rolesController);
app.use("/api/profiles", profilesController);
app.use("/api/preferences", preferencesController);
app.use("/api/languages", languagesController);
app.use("/api/notes", notesController);
app.use("/api/social-posts", socialPostsController);
app.use("/api/dict-api", dictionaryApiController);
app.use("/api/tts", ttsController);
app.use("/api/generative-ai", generativeAIController);

app.use(globalErrorHandler);

export default app;
