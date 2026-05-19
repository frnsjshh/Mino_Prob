import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(__dirname, "..", "data", "taratulong.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'volunteer', 'organization')),
      join_date TEXT NOT NULL,
      profile_pic TEXT DEFAULT '',
      facebook TEXT DEFAULT '',
      instagram TEXT DEFAULT '',
      linkedin TEXT DEFAULT '',
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS volunteers (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS organizations (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL DEFAULT '',
      location TEXT DEFAULT '',
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED'))
    );

    CREATE TABLE IF NOT EXISTS admins (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      organizer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      location TEXT DEFAULT '',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      slots_available INTEGER NOT NULL DEFAULT 0,
      image_url TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      volunteer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')),
      participated INTEGER DEFAULT 0,
      rating INTEGER DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
      UNIQUE(volunteer_id, event_id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_volunteer ON registrations(volunteer_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
}
