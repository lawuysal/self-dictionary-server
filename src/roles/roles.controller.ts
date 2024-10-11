import { Router, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { CreateRoleDto, CreateRoleSchema } from "./dtos/createRole.dto";
import { authGuard } from "../auth/middlewares/authGuard.middleware";
import rolesRepository from "./roles.repository";
import asyncHandler from "../utils/asyncHandler";

const router = Router();

// Create a new role
// POST api/roles
router.route("/").post(
  authGuard("ADMIN"),
  asyncHandler(async (req: Request<unknown, unknown, CreateRoleDto>, res) => {
    const parsedRole = CreateRoleSchema.parse(req.body);

    const role = await rolesRepository.createRole(parsedRole);

    res.status(StatusCodes.CREATED).json(role);
  }),
);

// Get all roles
// GET api/roles
router.route("/").get(
  authGuard("ADMIN"),
  asyncHandler(async (req, res) => {
    const roles = await rolesRepository.getRoles();

    res.status(StatusCodes.OK).json(roles);
  }),
);

// Get a role by Id
// GET api/roles/:id
router.route("/:id").get(
  authGuard("ADMIN"),
  asyncHandler(async (req, res) => {
    const role = await rolesRepository.getRoleById(req.params.id);

    res.status(StatusCodes.OK).json(role);
  }),
);

// Find roles of a given user Id
// GET api/roles/user/:userId
router.route("/user/:userId").get(
  asyncHandler(async (req: Request, res) => {
    const roles = await rolesRepository.getRolesByUserId(req.params.userId);

    res.status(StatusCodes.OK).json(roles);
  }),
);

// Delete a role by Id
// DELETE api/roles/:id
router.route("/:id").delete(
  authGuard("ADMIN"),
  asyncHandler(async (req, res) => {
    const role = await rolesRepository.deleteRole(req.params.id);

    res.status(StatusCodes.OK).json(role);
  }),
);

export default router;
