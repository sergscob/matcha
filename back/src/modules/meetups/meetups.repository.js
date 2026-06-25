import { pool } from "../../config/db.js";

export async function insertMeetup(proposerId, inviteeId, locationLabel, scheduledAt) {
  const result = await pool.query(
    `INSERT INTO meetups (proposer_id, invitee_id, location_label, scheduled_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [proposerId, inviteeId, locationLabel, scheduledAt]
  );

  return result.rows[0];
}

export async function findMeetupById(id) {
  const result = await pool.query(`SELECT * FROM meetups WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function updateMeetupStatus(id, status) {
  const result = await pool.query(
    `UPDATE meetups SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status]
  );

  return result.rows[0];
}

export async function listMeetupsForUser(userId) {
  const result = await pool.query(
    `SELECT
       m.id, m.proposer_id, m.invitee_id, m.location_label, m.scheduled_at, m.status, m.created_at,
       CASE WHEN m.proposer_id = $1 THEN m.invitee_id ELSE m.proposer_id END AS other_id,
       u.username, u.first_name, u.last_name, u.last_seen,
       (SELECT file_name FROM photos p WHERE p.user_id = u.id AND p.is_profile = TRUE LIMIT 1) AS profile_photo
     FROM meetups m
     JOIN users u ON u.id = CASE WHEN m.proposer_id = $1 THEN m.invitee_id ELSE m.proposer_id END
     WHERE m.proposer_id = $1 OR m.invitee_id = $1
     ORDER BY m.scheduled_at ASC`,
    [userId]
  );

  return result.rows;
}
