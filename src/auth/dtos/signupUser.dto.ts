import { z } from "zod";

export const SignupUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(30, "Password must be at most 30 characters long"),
  captchaToken: z.string(),
});

export type SignupUserDto = z.infer<typeof SignupUserSchema>;
