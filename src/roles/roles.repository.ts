import { StatusCodes } from "http-status-codes";
import { AppError } from "../middlewares/globalErrorMiddleware";
import { CreateRoleDto } from "./dtos/createRole.dto";
import { prisma } from "@/prisma/client";
import { Role, Prisma } from ".prisma/client";

// Type for the roles of a user with the role included
type RolesOnUserWithRole = Prisma.RolesOnUsersGetPayload<{
  include: { role: true };
}>[];

/**
 * Creates a new role in the database.
 * @async
 *
 * @param {CreateRoleDto} roleData - The role data to be created.
 * @param {string} roleData.name - The role's name.
 * @param {string?} roleData.description - The role's description. Can be a null
 *
 * @returns {Promise<Role>} A promise that resolves to the created role.
 *
 * @throws {AppError} Throws an AppError (HTTP 409) if there is an existing role with the same name.
 * @throws {Error} Throws an error if there is an issue creating the role.
 */
async function createRole(roleData: CreateRoleDto): Promise<Role> {
  const existingRole = await prisma.role.findUnique({
    where: { name: roleData.name },
  });

  if (existingRole) {
    throw new AppError("Role already exists", StatusCodes.CONFLICT);
  }

  const role = await prisma.role.create({ data: roleData });

  return role;
}

/**
 * Fetches all roles from the database.
 * @async
 *
 * @returns {Promise<Role[]>} A promise that resolves to the created role.
 *
 * @throws {Error} Throws an error if there is an issue fetching the roles.
 */
async function getRoles(): Promise<Role[]> {
  const roles = await prisma.role.findMany();

  return roles;
}

/**
 * Gets a role by its id.
 * @async
 *
 * @param {string} id - The role id to be fetched.
 *
 * @returns {Promise<Role | Null>} A promise that resolves to the created role.
 * @throws {Error} Throws an error if there is an issue fetching the role.
 */
async function getRoleById(id: string): Promise<Role | null> {
  const role = await prisma.role.findUnique({ where: { id } });

  return role;
}

/**
 * Gets all roles of a user by their id.
 * @async
 * @param {string} userId - The user id to fetch roles for.
 *
 * @returns {Promise<RolesOnUsersWithRole>} A promise that resolves to the roles of the user.
 * @throws {Error} Throws an error if there is an issue fetching the roles.
 */
async function getRolesByUserId(userId: string): Promise<RolesOnUserWithRole> {
  const roles = await prisma.rolesOnUsers.findMany({
    where: { userId },
    include: { role: true },
  });

  return roles;
}

/**
 * Deletes a role by its id.
 * Checks if the role is in use.
 *
 * @async
 * @param {string} id - The role id to be deleted.
 *
 * @returns {Promise<Role>} A promise that resolves to the deleted role.
 *
 * @throws {AppError} Throws an AppError (HTTP 409) if the role is in use.
 * @throws {Error} Throws an error if there is an issue with database connection
 */
async function deleteRole(id: string): Promise<Role> {
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
