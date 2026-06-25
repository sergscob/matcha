import { pool } from "../../config/db.js";

export async function hasMessageHistory(userId1, userId2) {
  const result = await pool.query(
    `SELECT 1 FROM messages
     WHERE (sender_id = $1 AND recipient_id = $2)
        OR (sender_id = $2 AND recipient_id = $1)
     LIMIT 1`,
    [userId1, userId2]
  );

  return result.rows.length > 0;
}

export async function insertMessage(senderId, recipientId, body) {
  const result = await pool.query(
    `INSERT INTO messages (sender_id, recipient_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, sender_id, recipient_id, body, created_at`,
    [senderId, recipientId, body]
  );

  return result.rows[0];
}

export async function listMessages(userId1, userId2, limit, offset) {
  const result = await pool.query(
    `SELECT id, sender_id, recipient_id, body, read_at, created_at
     FROM messages
     WHERE (sender_id = $1 AND recipient_id = $2)
        OR (sender_id = $2 AND recipient_id = $1)
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`,
    [userId1, userId2, limit, offset]
  );

  return result.rows.reverse();
}

export async function markMessagesRead(recipientId, senderId) {
  await pool.query(
    `UPDATE messages SET read_at = $1
     WHERE recipient_id = $2 AND sender_id = $3 AND read_at IS NULL`,
    [new Date(), recipientId, senderId]
  );
}

export async function listConversations(userId) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.first_name, u.last_name, u.last_seen,
       (SELECT file_name FROM photos p WHERE p.user_id = u.id AND p.is_profile = TRUE LIMIT 1) AS profile_photo,
       lm.body AS last_message_body,
       lm.created_at AS last_message_at,
       lm.sender_id AS last_message_sender_id,
       (SELECT COUNT(*) FROM messages
          WHERE sender_id = u.id AND recipient_id = $1 AND read_at IS NULL) AS unread_count
     FROM users u
     JOIN likes a ON a.liker_id = $1 AND a.liked_id = u.id
     JOIN likes b ON b.liker_id = u.id AND b.liked_id = $1
     LEFT JOIN LATERAL (
       SELECT body, created_at, sender_id FROM messages
       WHERE (sender_id = $1 AND recipient_id = u.id) OR (sender_id = u.id AND recipient_id = $1)
       ORDER BY created_at DESC LIMIT 1
     ) lm ON TRUE
     WHERE NOT EXISTS (
       SELECT 1 FROM blocks
       WHERE (blocker_id = $1 AND blocked_id = u.id) OR (blocker_id = u.id AND blocked_id = $1)
     )
     ORDER BY lm.created_at DESC NULLS LAST`,
    [userId]
  );

  return result.rows;
}
