import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import rolesRepository from "@/src/roles/roles.repository";
import asyncHandler from "@/src/utils/asyncHandler";

interface AuthRequest extends Request {
  userId?: string;
}

export function authGuard(role: string) {
  return asyncHandler(async function (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = (decoded as { userId: string }).userId;

    const roles = await rolesRepository.getRolesByUserId(req.userId);

    if (!roles.some((r) => r.role.name === role)) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    next();
  });
}
