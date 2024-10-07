import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import itemsController from "./items/items.controller";

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

export default app;
