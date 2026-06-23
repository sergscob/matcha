import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  const token = header.replace("Bearer ", "");

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = payload.userId;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
}