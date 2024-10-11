import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import itemsController from "./items/items.controller";
import authController from "./auth/auth.controller";
import rolesController from "./roles/roles.controller";
import { globalErrorHandler } from "./middlewares/globalErrorMiddleware";

const app = express();

// using morgan for logs
app.use(morgan("combined"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.use("/api/items", itemsController);
app.use("/api/auth", authController);
app.use("/api/roles", rolesController);

app.use(globalErrorHandler);

export default app;
