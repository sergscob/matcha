import { z } from "zod";

import { isCommonPassword } from "../../utils/commonPasswords.js";

const passwordSchema = z.string().min(8).max(128).refine(
  password => !isCommonPassword(password),
  "Password is too common"
);

export const registerSchema = z.object({
  email: z.email().max(254),

  username: z.string().min(3).max(30),

  firstName: z.string().min(1).max(50),

  lastName: z.string().min(1).max(50),

  password: passwordSchema
});

export const loginSchema = z.object({
  username: z.string().min(1).max(30),
  password: z.string().min(1).max(128)
});

export const verifyEmailSchema = z.object({
  token: z.string().length(64)
});

export const forgotPasswordSchema = z.object({
  email: z.email().max(254)
});

export const resetPasswordSchema = z.object({
  token: z.string().length(64),
  password: passwordSchema
});
