import { prisma } from "@/prisma/client";
import { SignupUserDto } from "./dtos/signupUser.dto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginUserDto } from "./dtos/loginUser.dto";
import { AppError } from "../middlewares/globalErrorMiddleware";
import { StatusCodes } from "http-status-codes";

async function signupUser(signupData: SignupUserDto) {
  const { email, password } = signupData;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError("User already exists", StatusCodes.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  const role = await prisma.role.findFirst({ where: { name: "USER" } });

  if (!role) {
    throw new AppError("Role not found", StatusCodes.NOT_FOUND);
  }

  await prisma.rolesOnUsers.create({
    data: {
      userId: user.id,
      roleId: role.id,
    },
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { token, userId: user.id };
}

async function loginUser(loginData: LoginUserDto) {
  const { email, password } = loginData;

  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    !user.password ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return null;
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { token, userId: user.id };
}

export default { loginUser, signupUser };
