import { Router } from "express";

import {
  registerController,
  loginController,
  logoutController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  meController
} from "./auth.controller.js";

import { optionalAuthMiddleware } from "../../middleware/auth.middleware.js";
import { authLimiter } from "../../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/register", authLimiter, registerController);
router.post("/login", authLimiter, loginController);
router.post("/logout", logoutController);
router.post("/verify-email", verifyEmailController);
router.post("/forgot-password", authLimiter, forgotPasswordController);
router.post("/reset-password", authLimiter, resetPasswordController);
router.get("/me", optionalAuthMiddleware, meController);

export default router;
