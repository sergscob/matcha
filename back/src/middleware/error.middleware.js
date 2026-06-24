import { ZodError } from "zod";
import { MulterError } from "multer";

import { AppError } from "../utils/AppError.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Not found" });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      issues: err.issues.map(issue => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (err instanceof MulterError) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}
