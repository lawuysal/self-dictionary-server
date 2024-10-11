import { Response, NextFunction, Request } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import asyncHandler from "@/src/utils/asyncHandler";
import { rolesRepository } from "@/src/roles/roles.repository";
import { Roles } from "@/src/roles/enums/roles.enum";

export function authGuard(role: string) {
  return asyncHandler(async function (
    req: Request,
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

    // if there a an admin role make req.isAdmin true
    req.isAdmin = roles.some((r) => r.role.name === Roles.ADMIN);

    // if there a an moderator role make req.isModerator true
    req.isModerator = roles.some((r) => r.role.name === Roles.MODERATOR);

    if (!roles.some((r) => r.role.name === role)) {
      res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
      return;
    }

    next();
  });
}
