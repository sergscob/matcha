import crypto from "crypto";
import fs from "fs";
import path from "path";

import { faker } from "@faker-js/faker";

import { pool } from "../config/db.js";
import { hashPassword } from "../utils/password.js";

const SEED_EMAIL_DOMAIN = "seed.example.com";
const SEED_PASSWORD = "MatchaUser1!";
const UPLOADS_DIR = path.resolve("uploads");
const PROFILE_PHOTO_RATE = 0.75;

// 10 solid-color 1x1 PNGs (each just a single RGB pixel, stretched to fill
// the photo grid via CSS) -- generated and chunk-verified programmatically,
// not hand-typed, since a hand-typed base64 PNG silently corrupted past the
// IDAT chunk last time (Chrome rendered it anyway, Firefox correctly didn't)
const PLACEHOLDER_SQUARES = [
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4amkKAANaAVQyQZovAAAAAElFTkSuQmCC",
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP43cMAAAQNAYixJnTrAAAAAElFTkSuQmCC",
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4e8MUAATgAgu75RjHAAAAAElFTkSuQmCC",
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNwXuAOAAJUASt8ma5FAAAAAElFTkSuQmCC",
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNg6KwGAAGRAQX2P1j+AAAAAElFTkSuQmCC",
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGOQ63gKAAJTAYzS8q3uAAAAAElFTkSuQmCC",
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGOIM90IAAI5AUXvsUkOAAAAAElFTkSuQmCC",
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGPoU1kFAAKgAV1CUK4HAAAAAElFTkSuQmCC",
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGO4IZ0AAAMiAVSVOUOYAAAAAElFTkSuQmCC",
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGPI9XEEAAIkAPtbH+IxAAAAAElFTkSuQmCC"
].map(b64 => Buffer.from(b64, "base64"));

const CITIES = [
  { label: "Paris", latitude: 48.8566, longitude: 2.3522 },
  { label: "Lyon", latitude: 45.764, longitude: 4.8357 },
  { label: "Marseille", latitude: 43.2965, longitude: 5.3698 },
  { label: "Toulouse", latitude: 43.6047, longitude: 1.4442 },
  { label: "Lille", latitude: 50.6292, longitude: 3.0573 },
  { label: "Bordeaux", latitude: 44.8378, longitude: -0.5792 },
  { label: "Nice", latitude: 43.7102, longitude: 7.262 },
  { label: "Nantes", latitude: 47.2184, longitude: -1.5536 }
];

const TAG_POOL = [
  "vegan", "vegetarian", "geek", "gaming", "hiking", "music", "cinema", "travel",
  "photography", "art", "yoga", "fitness", "cooking", "reading", "dancing", "anime",
  "tech", "startup", "climbing", "surfing", "skating", "coffee", "wine", "dogs",
  "cats", "nature", "philosophy", "politics", "volunteering", "language_exchange",
  "tattoo", "meditation", "running"
];

const ORIENTATIONS = [
  { value: "heterosexual", weight: 7 },
  { value: "homosexual", weight: 1 },
  { value: "bisexual", weight: 2 }
];

function pickOrientation() {
  return faker.helpers.weightedArrayElement(ORIENTATIONS);
}

function jitter(value, spread) {
  return value + (Math.random() * 2 - 1) * spread;
}

async function ensureTags() {
  const map = new Map();

  for (const name of TAG_POOL) {
    const result = await pool.query(
      `INSERT INTO tags (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name]
    );
    map.set(name, result.rows[0].id);
  }

  return map;
}

async function nextSeedIndex() {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM users WHERE email LIKE '%@' || $1`,
    [SEED_EMAIL_DOMAIN]
  );

  return result.rows[0].count;
}

function writePlaceholderPhoto() {
  const fileName = `${crypto.randomBytes(16).toString("hex")}.png`;
  const square = faker.helpers.arrayElement(PLACEHOLDER_SQUARES);
  fs.writeFileSync(path.join(UPLOADS_DIR, fileName), square);
  return fileName;
}

async function seedUser(index, passwordHash, tagIds) {
  const gender = faker.helpers.arrayElement(["male", "female"]);
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName();
  const slug = faker.helpers.slugify(`${firstName}_${lastName}`).toLowerCase().slice(0, 25);
  const username = index ? `seed_${slug}_${index}` : "user1";
  const orientation = pickOrientation();
  console.log(username)
  const email = `${username}@${SEED_EMAIL_DOMAIN}`;
  const city = faker.helpers.arrayElement(CITIES);
  const birthDate = faker.date.birthdate({ min: 18, max: 65, mode: "age" }).toISOString().slice(0, 10);
  const lastSeen = Math.random() < 0.8
    ? faker.date.recent({ days: 14 })
    : null;

  const result = await pool.query(
    `INSERT INTO users (
       email, username, first_name, last_name, password_hash, verified,
       gender, sexual_orientation, birth_date, bio,
       latitude, longitude, location_label, location_source,
       popularity_score, last_seen
     ) VALUES ($1,$2,$3,$4,$5,TRUE,$6,$7,$8,$9,$10,$11,$12,'manual',$13,$14)
     RETURNING id`,
    [
      email, username, firstName, lastName, passwordHash,
      gender, orientation, birthDate, faker.lorem.sentences({ min: 1, max: 3 }),
      jitter(city.latitude, 0.2), jitter(city.longitude, 0.2), city.label,
      faker.number.int({ min: 0, max: 150 }), lastSeen
    ]
  );

  const userId = result.rows[0].id;

  const tags = faker.helpers.arrayElements(tagIds, { min: 1, max: 6 });
  for (const tagId of tags) {
    await pool.query(
      `INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, tagId]
    );
  }

  if (Math.random() < PROFILE_PHOTO_RATE) {
    const fileName = writePlaceholderPhoto();
    await pool.query(
      `INSERT INTO photos (user_id, file_name, is_profile, position) VALUES ($1, $2, TRUE, 0)`,
      [userId, fileName]
    );
  }
}

async function seed(count) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const tagMap = await ensureTags();
  const tagIds = [...tagMap.values()];
  const passwordHash = await hashPassword(SEED_PASSWORD);
  const startIndex = await nextSeedIndex();

  console.log(`Seeding ${count} profiles starting at index ${startIndex}...`);

  for (let i = 0; i < count; i++) {
    await seedUser(startIndex + i, passwordHash, tagIds);

    if ((i + 1) % 50 === 0) {
      console.log(`  ${i + 1}/${count} created`);
    }
  }

  console.log(`Done. All seed accounts share the password: ${SEED_PASSWORD}`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const count = Number(process.argv[2]) || 500;

  await seed(count);
  process.exit();
}

export { seed };
