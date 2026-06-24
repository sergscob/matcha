import { pool } from "../../config/db.js";

export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0];
}

export async function findUserByUsername(username) {
  const result = await pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );

  return result.rows[0];
}

export async function createUser(user) {
  const result = await pool.query(
    `INSERT INTO users(email, username, first_name, last_name, password_hash)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [ user.email, user.username, user.firstName, user.lastName, user.passwordHash ]
  );

  return result.rows[0];
}

export async function findUserById(id) {
  const result = await pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}

export async function markUserVerified(userId) {
  await pool.query(
    `UPDATE users SET verified = TRUE WHERE id = $1`,
    [userId]
  );
}

export async function touchLastSeen(userId) {
  // Pass a JS Date as a bound parameter rather than using SQL NOW().
  // node-postgres serializes/parses "timestamp without time zone" using
  // local-time calendar math, so a value written via NOW() (computed
  // purely server-side, no local-time adjustment) reads back skewed by
  // the app server's UTC offset. Driver-serialized JS Date params don't
  // have this problem because the same local-time math applies
  // symmetrically on write and read.
  await pool.query(
    `UPDATE users SET last_seen = $2 WHERE id = $1`,
    [userId, new Date()]
  );
}

export async function updateUserPassword(userId, passwordHash) {
  await pool.query(
    `UPDATE users SET password_hash = $2 WHERE id = $1`,
    [userId, passwordHash]
  );
}

export async function createEmailVerification(userId, token, expiresAt) {
  await pool.query(
    `INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
}

export async function findEmailVerificationByToken(token) {
  const result = await pool.query(
    `SELECT * FROM email_verifications WHERE token = $1`,
    [token]
  );

  return result.rows[0];
}

export async function markEmailVerificationUsed(id) {
  await pool.query(
    `UPDATE email_verifications SET used = TRUE WHERE id = $1`,
    [id]
  );
}

export async function createPasswordReset(userId, token, expiresAt) {
  await pool.query(
    `INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
}

export async function findPasswordResetByToken(token) {
  const result = await pool.query(
    `SELECT * FROM password_resets WHERE token = $1`,
    [token]
  );

  return result.rows[0];
}

export async function markPasswordResetUsed(id) {
  await pool.query(
    `UPDATE password_resets SET used = TRUE WHERE id = $1`,
    [id]
  );
}