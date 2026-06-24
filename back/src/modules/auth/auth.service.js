import {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  markUserVerified,
  updateUserPassword,
  createEmailVerification,
  findEmailVerificationByToken,
  markEmailVerificationUsed,
  createPasswordReset,
  findPasswordResetByToken,
  markPasswordResetUsed
} from "./auth.repository.js";

import { hashPassword, verifyPassword } from "../../utils/password.js";
import { generateToken } from "../../utils/jwt.js";
import { generateSecureToken } from "../../utils/token.js";
import { sendMail } from "../../utils/mailer.js";
import { AppError } from "../../utils/AppError.js";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export async function register(data) {
  const emailExists = await findUserByEmail(data.email);

  if (emailExists) {
    throw new AppError("Email already exists", 409);
  }

  const usernameExists = await findUserByUsername(data.username);

  if (usernameExists) {
    throw new AppError("Username already exists", 409);
  }

  const passwordHash = await hashPassword(data.password);
  const user = await createUser({ ...data, passwordHash });
  const token = generateSecureToken();

  await createEmailVerification(
    user.id,
    token,
    new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS)
  );

  await sendMail({
    to: user.email,
    subject: "Verify your Matcha account",
    html: `
      <p>Welcome to Matcha!</p>
      <p>
        Click <a href="${process.env.FRONTEND_URL}/verify-email/${token}">here</a>
        to verify your account. This link expires in 24 hours.
      </p>
    `
  });

  return user;
}

export async function login(username, password) {
  const user = await findUserByUsername(username);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await verifyPassword(user.password_hash, password);

  if (!valid) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.verified) {
    throw new AppError("Please verify your email before logging in", 403);
  }

  const token = generateToken(user.id);

  return { token };
}

export async function verifyEmail(token) {
  const verification = await findEmailVerificationByToken(token);

  if (!verification || verification.used || verification.expires_at < new Date()) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  await markUserVerified(verification.user_id);
  await markEmailVerificationUsed(verification.id);
}

export async function requestPasswordReset(email) {
  const user = await findUserByEmail(email);

  if (!user) {
    return;
  }

  const token = generateSecureToken();

  await createPasswordReset(
    user.id,
    token,
    new Date(Date.now() + PASSWORD_RESET_TTL_MS)
  );

  await sendMail({
    to: user.email,
    subject: "Reset your Matcha password",
    html: `
      <p>
        Click <a href="${process.env.FRONTEND_URL}/reset-password/${token}">here</a>
        to reset your password. This link expires in 1 hour.
      </p>
      <p>If you didn't request this, you can ignore this email.</p>
    `
  });
}

export async function resetPassword(token, newPassword) {
  const reset = await findPasswordResetByToken(token);

  if (!reset || reset.used || reset.expires_at < new Date()) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const passwordHash = await hashPassword(newPassword);

  await updateUserPassword(reset.user_id, passwordHash);
  await markPasswordResetUsed(reset.id);
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}
