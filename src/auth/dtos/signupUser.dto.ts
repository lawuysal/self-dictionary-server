import { z } from "zod";

export const SignupUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type SignupUserDto = z.infer<typeof SignupUserSchema>;
