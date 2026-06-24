import { z } from "zod";

import { isCommonPassword } from "../../utils/commonPasswords.js";

const passwordSchema = z.string().min(8).refine(
  password => !isCommonPassword(password),
  "Password is too common"
);

export const registerSchema = z.object({
  email: z.email(),

  username: z.string().min(3).max(30),

  firstName: z.string().min(1),

  lastName: z.string().min(1),

  password: passwordSchema
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1)
});

export const forgotPasswordSchema = z.object({
  email: z.email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema
});
