import express from "express";
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

const app = express();

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
