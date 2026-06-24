import { pool } from "../../config/db.js";

export async function createNotification(userId, actorId, type) {
  await pool.query(
    `INSERT INTO notifications (user_id, actor_id, type) VALUES ($1, $2, $3)`,
    [userId, actorId, type]
  );
}

export async function listNotifications(userId, limit, offset) {
  const result = await pool.query(
    `SELECT n.id, n.type, n.is_read, n.created_at, u.id AS actor_id, u.username AS actor_username
     FROM notifications n
     LEFT JOIN users u ON u.id = n.actor_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
}

export async function countUnread(userId) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );

  return Number(result.rows[0].count);
}

export async function markAllRead(userId) {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
}

export async function markOneRead(id, userId) {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
}
