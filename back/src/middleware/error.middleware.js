import { ZodError } from "zod";
import { MulterError } from "multer";

import { AppError } from "../utils/AppError.js";

export function notFoundHandler(req, res) {
  res.status(200).json({ error: true, message: "Not found" });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(200).json({
      error: true,
      message: "Validation error",
      issues: err.issues.map(issue => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (err instanceof MulterError) {
    return res.status(200).json({ error: true, message: err.message });
  }

  if (err instanceof AppError) {
    return res.status(200).json({ error: true, message: err.message });
  }

  console.error(err);
  res.status(200).json({ error: true, message: "Internal server error" });
}
