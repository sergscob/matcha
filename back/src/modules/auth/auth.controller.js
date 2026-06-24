import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "./auth.validation.js";

import {
  register,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getCurrentUser
} from "./auth.service.js";

const AUTH_COOKIE_NAME = "token";

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
};

export async function registerController(req, res) {
  const data = registerSchema.parse(req.body);
  const user = await register(data);

  res.status(201).json({ id: user.id });
}

export async function loginController(req, res) {
  const data = loginSchema.parse(req.body);
  const result = await login(data.username, data.password);

  res.cookie(AUTH_COOKIE_NAME, result.token, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ message: "Logged in" });
}

export function logoutController(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
  res.json({ message: "Logged out" });
}

export async function verifyEmailController(req, res) {
  const data = verifyEmailSchema.parse(req.body);
  await verifyEmail(data.token);

  res.json({ message: "Email verified" });
}

export async function forgotPasswordController(req, res) {
  const data = forgotPasswordSchema.parse(req.body);
  await requestPasswordReset(data.email);

  res.json({ message: "If that email exists, a reset link has been sent" });
}

export async function resetPasswordController(req, res) {
  const data = resetPasswordSchema.parse(req.body);
  await resetPassword(data.token, data.password);

  res.json({ message: "Password updated" });
}

export async function meController(req, res) {
  if (!req.userId) {
    return res.json({ user: null });
  }

  const user = await getCurrentUser(req.userId);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      verified: user.verified
    }
  });
}
