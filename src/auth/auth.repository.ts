import { prisma } from "@/prisma/client";
import { SignupUserDto } from "./dtos/signupUser.dto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginUserDto } from "./dtos/loginUser.dto";
import { AppError } from "../middlewares/globalErrorMiddleware";
import { StatusCodes } from "http-status-codes";
import { Roles } from "../roles/enums/roles.enum";

/**
 * Signs up the new user, assgings the USER role and returns a JWT token and user ID.
 * @async
 *
 * @param {SignupUserDto} signupData - The signup credentials for the user.
 * @param {string} signupData.mail - The user's email address.
 * @param {string} signupData.password - The user's password.
 * successful, or null if the signup fails.
 *
 * @throws {AppError} Throws an AppError (HTTP 409) if there is an exsiting user with the same email address.
 * @throws {AppError} Throws an AppError (HTTP 404) if the role is not found.
 * @throws {Error} Throws an error if there is an issue with the database or other unexpected errors.
 */
async function signupUser(signupData: SignupUserDto) {
  const { email, password } = signupData;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError("User already exists", StatusCodes.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const emailVerificationToken = jwt.sign(
    { userEmail: email },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EMAIL_VERIFICATION_EXPIRES_IN,
    },
  );

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, emailVerificationToken },
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

  return { emailVerificationToken };
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

  if (!user.isEmailVerified) {
    throw new AppError("Email not verified", StatusCodes.UNAUTHORIZED);
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { token, userId: user.id };
}

async function verifyEmail(emailVerificationToken: string) {
  const decoded = jwt.verify(
    emailVerificationToken,
    process.env.JWT_SECRET!,
  ) as { userEmail: string };

  let user = await prisma.user.findUnique({
    where: { email: decoded.userEmail },
  });

  if (!user) {
    throw new AppError("Invalid Verification Token", StatusCodes.BAD_REQUEST);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email already verified", StatusCodes.CONFLICT);
  }

  user = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
    },
  });

  return user;
}

async function checkPasswordResetToken(passwordResetToken: string) {
  const decoded = jwt.verify(passwordResetToken, process.env.JWT_SECRET!) as {
    userEmail: string;
  };

  const user = await prisma.user.findUnique({
    where: { email: decoded.userEmail },
  });

  if (!user) {
    throw new AppError("Invalid Password Reset Token", StatusCodes.BAD_REQUEST);
  }

  if (user.passwordResetToken !== passwordResetToken) {
    throw new AppError("Invalid Password Reset Token", StatusCodes.BAD_REQUEST);
  }

  return user;
}

async function forgotPassword(email: string) {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  const passwordResetToken = jwt.sign(
    { userEmail: email },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRES_IN,
    },
  );

  user = await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken },
  });

  return user;
}

async function resetPassword(passwordResetToken: string, password: string) {
  const decoded = jwt.verify(passwordResetToken, process.env.JWT_SECRET!) as {
    userEmail: string;
  };

  let user = await prisma.user.findUnique({
    where: { email: decoded.userEmail },
  });

  if (!user) {
    return null;
  }

  if (user.passwordResetToken !== passwordResetToken) {
    throw new AppError("Invalid Password Reset Token", StatusCodes.BAD_REQUEST);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetAt: new Date(),
    },
  });

  return user;
}

export const authRepository = {
  loginUser,
  signupUser,
  verifyEmail,
  forgotPassword,
  checkPasswordResetToken,
  resetPassword,
};
