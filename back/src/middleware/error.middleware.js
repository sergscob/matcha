import { ZodError } from "zod";
import { MulterError } from "multer";

import { AppError } from "../utils/AppError.js";

// Every response below is sent with HTTP 200, even for application-level
// errors. The browser console automatically logs a "Failed to load
// resource" entry for any non-2xx fetch response regardless of how the
// frontend handles it -- since the subject requires zero console output,
// errors are signaled via an `error: true` flag in the body instead of the
// HTTP status code, and the frontend checks that flag (front/src/api/client.js).
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
