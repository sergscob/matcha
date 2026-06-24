import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dictPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "common-passwords.txt"
);

const passwords = new Set(
  fs.readFileSync(dictPath, "utf8")
    .split("\n")
    .map(p => p.trim().toLowerCase())
    .filter(Boolean)
);

export function isCommonPassword(password) {
  return passwords.has(password.toLowerCase());
}
