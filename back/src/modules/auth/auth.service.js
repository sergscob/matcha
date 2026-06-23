import {
  findUserByEmail,
  findUserByUsername,
  createUser
} from "./auth.repository.js";

import {
  hashPassword,
  verifyPassword
} from "../../utils/password.js";

import { generateToken } from "../../utils/jwt.js";

export async function register(data) {
  const emailExists =
    await findUserByEmail(data.email);

  if (emailExists) {
    throw new Error("Email already exists");
  }

  const usernameExists =
    await findUserByUsername(
      data.username
    );

  if (usernameExists) {
    throw new Error(
      "Username already exists"
    );
  }

  const passwordHash =
    await hashPassword(data.password);

  const user = await createUser({
    ...data,
    passwordHash
  });

  return user;
}

export async function login(
  username,
  password
) {
  const user =
    await findUserByUsername(username);

  if (!user) {
    throw new Error(
      "Invalid credentials"
    );
  }

  const valid =
    await verifyPassword(
      user.password_hash,
      password
    );

  if (!valid) {
    throw new Error(
      "Invalid credentials"
    );
  }

  const token =
    generateToken(user.id);

  return {
    token
  };
}