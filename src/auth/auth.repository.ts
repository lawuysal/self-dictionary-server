import { prisma } from "@/prisma/client";
import { SignupUserDto } from "./dtos/signupUser.dto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginUserDto } from "./dtos/loginUser.dto";
import { AppError } from "../middlewares/globalErrorMiddleware";
import { StatusCodes } from "http-status-codes";
import { Roles } from "../roles/enums/roles.enum";

/**
 * Signs up the new user and returns a JWT token and user ID.
 * @async
 *
 * @param {SignupUserDto} signupData - The login credentials for the user.
 * @param {string} loginData.mail - The user's email address.
 * @param {string} loginData.password - The user's password.
 * @returns {Promise<{ token: string; userId: string }} A promise that resolves to an object containing the token and user ID if signup is successful, or null if the login fails.
 *
 * @throws {AppError} Throws an AppError (HTTP 409) if there is an exsiting user with the same email address.
 * @throws {AppError} Throws an AppError (HTTP 404) if the role is not found.
 * @throws {Error} Throws an error if there is an issue with the database or other unexpected errors.
 */
async function signupUser(
  signupData: SignupUserDto,
): Promise<{ token: string; userId: string }> {
  const { email, password } = signupData;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError("User already exists", StatusCodes.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  const role = await prisma.role.findFirst({ where: { name: Roles.USER } });

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

/**
 * Logs in a user and returns a JWT token and user ID.
 * @async
 *
 * @param {LoginUserDto} loginData - The login credentials for the user.
 * @param {string} loginData.mail - The user's email address.
 * @param {string} loginData.password - The user's password.
 * @returns {Promise<{ token: string; userId: string } | null>} A promise that resolves to an object containing the token and user ID if login is successful, or null if the login fails.
 *
 * @throws {Error} Throws an error if there is an issue with the database or other unexpected errors.
 */
async function loginUser(
  loginData: LoginUserDto,
): Promise<{ token: string; userId: string } | null> {
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

export const authRepository = { loginUser, signupUser };
