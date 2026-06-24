import jwt from "jsonwebtoken";

import { touchLastSeen } from "../modules/auth/auth.repository.js";

export function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = payload.userId;
    touchLastSeen(req.userId).catch(() => {});
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function optionalAuthMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (token) {
    try {
      req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
    } catch {
      // invalid/expired token: treat the request as anonymous
    }
  }

  next();
}
