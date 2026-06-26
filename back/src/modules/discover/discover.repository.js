import { pool } from "../../config/db.js";

export async function hasProfilePhoto(userId) {
  const result = await pool.query(
    `SELECT 1 FROM photos WHERE user_id = $1 AND is_profile = TRUE`,
    [userId]
  );

  return result.rows.length > 0;
}

export async function isBlockedEitherWay(userId1, userId2) {
  const result = await pool.query(
    `SELECT 1 FROM blocks
     WHERE (blocker_id = $1 AND blocked_id = $2)
        OR (blocker_id = $2 AND blocked_id = $1)`,
    [userId1, userId2]
  );

  return result.rows.length > 0;
}

export async function hasLiked(likerId, likedId) {
  const result = await pool.query(
    `SELECT 1 FROM likes WHERE liker_id = $1 AND liked_id = $2`,
    [likerId, likedId]
  );

  return result.rows.length > 0;
}

export async function insertLike(likerId, likedId) {
  await pool.query(
    `INSERT INTO likes (liker_id, liked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [likerId, likedId]
  );
}

export async function deleteLike(likerId, likedId) {
  await pool.query(
    `DELETE FROM likes WHERE liker_id = $1 AND liked_id = $2`,
    [likerId, likedId]
  );
}

export async function insertBlock(blockerId, blockedId) {
  await pool.query(
    `INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [blockerId, blockedId]
  );
}

export async function deleteBlock(blockerId, blockedId) {
  await pool.query(
    `DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2`,
    [blockerId, blockedId]
  );
}

export async function isBlockedByMe(blockerId, blockedId) {
  const result = await pool.query(
    `SELECT 1 FROM blocks WHERE blocker_id = $1 AND blocked_id = $2`,
    [blockerId, blockedId]
  );

  return result.rows.length > 0;
}

export async function insertFakeReport(reporterId, reportedId) {
  await pool.query(
    `INSERT INTO fake_reports (reporter_id, reported_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [reporterId, reportedId]
  );
}

export async function listConnections(userId) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.first_name, u.last_name, u.last_seen,
       (SELECT file_name FROM photos p WHERE p.user_id = u.id AND p.is_profile = TRUE LIMIT 1) AS profile_photo,
       GREATEST(a.created_at, b.created_at) AS connected_at
     FROM users u
     JOIN likes a ON a.liker_id = $1 AND a.liked_id = u.id
     JOIN likes b ON b.liker_id = u.id AND b.liked_id = $1
     WHERE NOT EXISTS (
       SELECT 1 FROM blocks
       WHERE (blocker_id = $1 AND blocked_id = u.id) OR (blocker_id = u.id AND blocked_id = $1)
     )
     ORDER BY connected_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function recordProfileView(viewerId, viewedId) {
  await pool.query(
    `INSERT INTO profile_views (viewer_id, viewed_id) VALUES ($1, $2)`,
    [viewerId, viewedId]
  );
}


// "умный" рейтинг, два уровня:
// сначала те, кто в радиусе 50 км (distance_km <= 50) — единичный приоритетный бакет
// внутри—по формуле: common_tags × 15 + popularity − COALESCE(distance_km, 500)

export async function queryProfiles(viewer, options) {
  const {
    applyOrientationFilter,
    ageMin,
    ageMax,
    popularityMin,
    popularityMax,
    location,
    tags,
    sortBy,
    sortOrder,
    limit = 20,
    offset = 0
  } = options;

  const params = [viewer.id];
  const conditions = [
    "u.id != $1",
    "u.gender IS NOT NULL",
    `NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE (blocker_id = $1 AND blocked_id = u.id)
         OR (blocker_id = u.id AND blocked_id = $1)
    )`
  ];

  if (applyOrientationFilter) {
    params.push(viewer.gender, viewer.sexual_orientation);
    const genderIdx = params.length - 1;
    const orientationIdx = params.length;

    conditions.push(`
      (
        CASE COALESCE($${orientationIdx}, 'bisexual')
          WHEN 'bisexual' THEN TRUE
          WHEN 'heterosexual' THEN $${genderIdx}::varchar IS NULL OR u.gender != $${genderIdx}
          WHEN 'homosexual' THEN $${genderIdx}::varchar IS NULL OR u.gender = $${genderIdx}
          ELSE TRUE
        END
      )
      AND
      (
        CASE COALESCE(u.sexual_orientation, 'bisexual')
          WHEN 'bisexual' THEN TRUE
          WHEN 'heterosexual' THEN $${genderIdx}::varchar IS NULL OR u.gender != $${genderIdx}
          WHEN 'homosexual' THEN $${genderIdx}::varchar IS NULL OR u.gender = $${genderIdx}
          ELSE TRUE
        END
      )
    `);
  }

  if (ageMin !== undefined) {
    params.push(ageMin);
    conditions.push(`DATE_PART('year', AGE(u.birth_date)) >= $${params.length}`);
  }

  if (ageMax !== undefined) {
    params.push(ageMax);
    conditions.push(`DATE_PART('year', AGE(u.birth_date)) <= $${params.length}`);
  }

  if (popularityMin !== undefined) {
    params.push(popularityMin);
    conditions.push(`u.popularity_score >= $${params.length}`);
  }

  if (popularityMax !== undefined) {
    params.push(popularityMax);
    conditions.push(`u.popularity_score <= $${params.length}`);
  }

  if (location) {
    params.push(`%${location}%`);
    conditions.push(`u.location_label ILIKE $${params.length}`);
  }

  if (tags && tags.length > 0) {
    params.push(tags);
    conditions.push(`
      EXISTS (
        SELECT 1 FROM user_tags ut
        JOIN tags t ON t.id = ut.tag_id
        WHERE ut.user_id = u.id AND t.name = ANY($${params.length})
      )
    `);
  }

  params.push(viewer.id);
  const commonTagsIdx = params.length;

  let distanceExpr = "NULL::double precision";
  if (viewer.latitude != null && viewer.longitude != null) {
    params.push(viewer.latitude, viewer.longitude);
    const latIdx = params.length - 1;
    const lngIdx = params.length;

    distanceExpr = `
      CASE WHEN u.latitude IS NULL THEN NULL ELSE
        6371 * acos(LEAST(1, GREATEST(-1,
          cos(radians($${latIdx})) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians($${lngIdx}))
          + sin(radians($${latIdx})) * sin(radians(u.latitude))
        )))
      END
    `;
  }

  const sortColumns = {
    age: "age",
    popularity: "popularity_score",
    location: "distance_km",
    tags: "common_tags"
  };

  // "location" means proximity, so nearest-first (ascending distance) is the
  // sensible default direction; the other fields default to highest-first.
  const defaultAscending = { location: true };

  let orderClause;
  if (sortBy && sortColumns[sortBy]) {
    const ascending = sortOrder ? sortOrder === "asc" : Boolean(defaultAscending[sortBy]);
    orderClause = `${sortColumns[sortBy]} ${ascending ? "ASC" : "DESC"} NULLS LAST`;
  } else {
    orderClause = `
      (CASE WHEN distance_km IS NOT NULL AND distance_km <= 50 THEN 1 ELSE 0 END) DESC,
      (COALESCE(common_tags, 0) * 15 + popularity_score - COALESCE(distance_km, 500)) DESC
    `;
  }

  params.push(limit, offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const sql = `
    SELECT * FROM (
      SELECT
        u.id, u.username, u.first_name, u.last_name, u.gender, u.sexual_orientation,
        u.location_label, u.latitude, u.longitude, u.popularity_score, u.last_seen,
        DATE_PART('year', AGE(u.birth_date)) AS age,
        (SELECT file_name FROM photos p WHERE p.user_id = u.id AND p.is_profile = TRUE LIMIT 1) AS profile_photo,
        (
          SELECT COUNT(*) FROM user_tags ut
          WHERE ut.user_id = u.id
            AND ut.tag_id IN (SELECT tag_id FROM user_tags WHERE user_id = $${commonTagsIdx})
        ) AS common_tags,
        ${distanceExpr} AS distance_km
      FROM users u
      WHERE ${conditions.join(" AND ")}
    ) candidates
    ORDER BY ${orderClause}
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const result = await pool.query(sql, params);
  return result.rows;
}
