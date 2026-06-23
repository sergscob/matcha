import fs from "fs";

const passwords = new Set(
    fs
        .readFileSync("./common-passwords.txt", "utf8")
        .split("\n")
        .map(p => p.trim().toLowerCase())
);

export function isCommonPassword(password) {
    return passwords.has(password.toLowerCase());
}