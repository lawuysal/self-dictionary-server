import { Router } from "express";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import { Roles } from "../roles/enums/roles.enum";
import asyncHandler from "../utils/asyncHandler";
import { StatusCodes } from "http-status-codes";

const DICT_API_URL = process.env.DICT_API_URL || "";
const DICT_API_KEY = process.env.DICT_API_KEY || "";

const router = Router();

// Get all langs avaliable from API
// GET: /api/dict-api/langs
router.route("/langs").get(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const response = await fetch(
      `${DICT_API_URL}/getLangs?key=${DICT_API_KEY}`,
    );

    const data = await response.json();

    // console.log(response);

    res.status(StatusCodes.OK).json(data);
  }),
);

router.route("/lookup").get(
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const response = await fetch(
      `${DICT_API_URL}/lookup?key=${DICT_API_KEY}&lang=en-tr&text=ti%`,
    );

    const data = await response.json();

    // console.log(response);

    res.status(StatusCodes.OK).json(data);
  }),
);

export const dictionaryApiController = router;
