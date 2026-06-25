import { pool } from "../config/db.js";
import { seed } from "./seed.js";

const result = await pool.query(`SELECT COUNT(*)::int AS count FROM users`);

if (result.rows[0].count === 0) {
  console.log("No users found, seeding the database...");
  await seed(Number(process.env.SEED_COUNT) || 500);
} else {
  console.log("Users already exist, skipping seed.");
}

process.exit();
