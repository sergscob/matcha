import { pool } from "../../config/db.js";

export async function findUserByEmail(email) {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
}

export async function findUserByUsername(username) {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE username = $1
    `,
    [username]
  );

  return result.rows[0];
}

export async function createUser(user) {
  const result = await pool.query(
    `
    INSERT INTO users
    (
      email,
      username,
      first_name,
      last_name,
      password_hash
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING *
    `,
    [
      user.email,
      user.username,
      user.firstName,
      user.lastName,
      user.passwordHash
    ]
  );

  return result.rows[0];
}