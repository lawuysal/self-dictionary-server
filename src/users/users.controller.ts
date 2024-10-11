import { Router } from "express";
import { prisma } from "../../prisma/client";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.route("/").get(async (req, res) => {
  const users = await prisma.user.findMany();

  res.status(StatusCodes.OK).json(users);
});
