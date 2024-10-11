import { StatusCodes } from "http-status-codes";
import { AppError } from "../middlewares/globalErrorMiddleware";
import { CreateRoleDto } from "./dtos/createRole.dto";
import { prisma } from "@/prisma/client";

async function createRole(roleData: CreateRoleDto) {
  const existingRole = await prisma.role.findUnique({
    where: { name: roleData.name },
  });

  if (existingRole) {
    throw new AppError("Role already exists", StatusCodes.CONFLICT);
  }

  const role = await prisma.role.create({ data: roleData });

  return role;
}

async function getRoles() {
  const roles = await prisma.role.findMany();

  return roles;
}

async function getRoleById(id: string) {
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    throw new AppError("Role not found", StatusCodes.NOT_FOUND);
  }

  return role;
}

async function getRolesByUserId(userId: string) {
  const roles = await prisma.rolesOnUsers.findMany({
    where: { userId },
    include: { role: true },
  });

  return roles;
}

async function deleteRole(id: string) {
  const rolesOnUsers = await prisma.rolesOnUsers.findMany({
    where: { roleId: id },
  });

  if (rolesOnUsers.length > 0) {
    throw new AppError("Role is in use", StatusCodes.CONFLICT);
  }

  const role = await prisma.role.delete({ where: { id } });

  return role;
}

export default {
  createRole,
  getRoles,
  getRoleById,
  getRolesByUserId,
  deleteRole,
};
