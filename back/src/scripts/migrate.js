import fs from "fs";
import path from "path";

import { pool } from "../config/db.js";

const migrationsDir =
  path.resolve(
    "db/migrations"
  );

const files = fs.readdirSync(migrationsDir).sort();

for (const file of files) {
  const sql =
    fs.readFileSync(
      path.join(
        migrationsDir,
        file
      ),
      "utf8"
    );

  console.log(
    `Running ${file}`
  );

  await pool.query(sql);
}

console.log("Done");

process.exit();