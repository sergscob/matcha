import jwt from "jsonwebtoken";

export function createAccessToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}