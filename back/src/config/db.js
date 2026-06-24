import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool, types } = pg;

// OID 1082 = DATE. Without this, node-postgres parses DATE columns into
// JS Date objects using local-timezone calendar math, which silently
// shifts the calendar day around DST boundaries. Keep it as a plain string.
types.setTypeParser(1082, value => value);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});