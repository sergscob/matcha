import { pool } from "../../config/db.js";

const COLUMN_MAP = {
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  gender: "gender",
  sexualOrientation: "sexual_orientation",
  bio: "bio",
  birthDate: "birth_date",
  verified: "verified"
};

export async function getUserById(userId) {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
  return result.rows[0];
}

export async function incrementPopularity(userId, delta) {
  await pool.query(
    `UPDATE users SET popularity_score = GREATEST(0, popularity_score + $2) WHERE id = $1`,
    [userId, delta]
  );
}

export async function updateUser(userId, fields) {
  const sets = [];
  const values = [];

  for (const [key, column] of Object.entries(COLUMN_MAP)) {
    if (fields[key] !== undefined) {
      values.push(fields[key]);
      sets.push(`${column} = $${values.length}`);
    }
  }

  if (sets.length === 0) {
    return getUserById(userId);
  }

  values.push(userId);
  const result = await pool.query(
    `UPDATE users SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values
  );

  return result.rows[0];
}

export async function updateUserLocation(userId, { latitude, longitude, locationLabel, locationSource }) {
  const result = await pool.query(
    `UPDATE users
     SET latitude = $1, longitude = $2, location_label = $3, location_source = $4
     WHERE id = $5
     RETURNING *`,
    [latitude, longitude, locationLabel, locationSource, userId]
  );

  return result.rows[0];
}

export async function getTagsForUser(userId) {
  const result = await pool.query(
    `SELECT t.name FROM tags t JOIN user_tags ut ON ut.tag_id = t.id WHERE ut.user_id = $1 ORDER BY t.name`,
    [userId]
  );

  return result.rows.map(row => row.name);
}

export async function searchTags(query, limit = 10) {
  const result = await pool.query(
    `SELECT name FROM tags WHERE name ILIKE $1 ORDER BY name LIMIT $2`,
    [`%${query}%`, limit]
  );

  return result.rows.map(row => row.name);
}

export async function syncUserTags(userId, tagNames) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tagIds = [];
    for (const name of tagNames) {
      const result = await client.query(
        `INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name]
      );
      tagIds.push(result.rows[0].id);
    }

    await client.query(`DELETE FROM user_tags WHERE user_id = $1`, [userId]);

    for (const tagId of tagIds) {
      await client.query(`INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2)`, [userId, tagId]);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getPhotosForUser(userId) {
  const result = await pool.query(
    `SELECT id, file_name, is_profile FROM photos WHERE user_id = $1 ORDER BY position, id`,
    [userId]
  );

  return result.rows;
}

export async function countPhotosForUser(userId) {
  const result = await pool.query(`SELECT COUNT(*) FROM photos WHERE user_id = $1`, [userId]);
  return Number(result.rows[0].count);
}

export async function insertPhoto(userId, fileName, isProfile) {
  const result = await pool.query(
    `INSERT INTO photos (user_id, file_name, is_profile) VALUES ($1, $2, $3) RETURNING *`,
    [userId, fileName, isProfile]
  );

  return result.rows[0];
}

export async function findPhotoById(photoId, userId) {
  const result = await pool.query(
    `SELECT * FROM photos WHERE id = $1 AND user_id = $2`,
    [photoId, userId]
  );

  return result.rows[0];
}

export async function deletePhoto(photoId, userId) {
  const result = await pool.query(
    `DELETE FROM photos WHERE id = $1 AND user_id = $2 RETURNING *`,
    [photoId, userId]
  );

  return result.rows[0];
}

export async function setProfilePhoto(photoId, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`UPDATE photos SET is_profile = FALSE WHERE user_id = $1`, [userId]);

    const result = await client.query(
      `UPDATE photos SET is_profile = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
      [photoId, userId]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getProfileViewers(userId) {
  const result = await pool.query(
    `SELECT u.id, u.username, MAX(pv.viewed_at) AS viewed_at
     FROM profile_views pv
     JOIN users u ON u.id = pv.viewer_id
     WHERE pv.viewed_id = $1
     GROUP BY u.id, u.username
     ORDER BY viewed_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function getLikers(userId) {
  const result = await pool.query(
    `SELECT u.id, u.username, l.created_at
     FROM likes l
     JOIN users u ON u.id = l.liker_id
     WHERE l.liked_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );

  return result.rows;
}
