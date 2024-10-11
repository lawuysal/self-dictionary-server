import { z } from "zod";

export const CreateRoleSchema = z.object({
  name: z.string().min(3, "Name is too short"),
  description: z.string().nullable(),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
