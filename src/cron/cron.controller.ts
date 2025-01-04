import { Router } from "express";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import { Roles } from "../roles/enums/roles.enum";
import asyncHandler from "../utils/asyncHandler";
import { StatusCodes } from "http-status-codes";
import { prisma } from "@/prisma/client";
import { z } from "zod";

const router = Router();

const paramsIdSchema = z.object({
  id: z.string().uuid(),
});

// Get last 7 days of calculated average intensity
// GET /cron/average-intensity
router.get(
  "/average-intensity/:id",
  authGuard(Roles.USER),
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const parsedParams = paramsIdSchema.safeParse(req.params);

    if (!parsedParams.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid id" });
      return;
    }

    if (!req.isAdmin && userId !== parsedParams.data.id) {
      res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
      return;
    }

    const averageIntensities =
      await prisma.cronDailyAverageAllNotesIntensity.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          ownerId: parsedParams.data.id,
        },
        take: 7,
      });

    res.status(StatusCodes.OK).json(averageIntensities);
  }),
);

export const cronController = router;
