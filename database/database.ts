import Database from "better-sqlite3"
import { existsSync } from "fs"

const getDbVersion = () => db.prepare("PRAGMA user_version").get().user_version
const setDbVersion = (version: number) => db.prepare(`PRAGMA user_version = ${version}`).run()

const path = "./database/main.db"
const databaseExists = existsSync(path)
export const db = new Database(path)

const migrations = [
  {
    version: 0,
    script: `
    CREATE TABLE Members (
      username TEXT PRIMARY KEY,
      skin TEXT NOT NULL,
      lastUpdated INTEGER NOT NULL
    );`
  },
  {
    version: 1,
    script: `
      ALTER TABLE Members RENAME TO MembersOld;

      CREATE TABLE Members (
        username TEXT PRIMARY KEY,
        skin TEXT,
        skinLastUpdated INTEGER NOT NULL DEFAULT 0,
        uuid TEXT,
        uuidLastUpdated INTEGER NOT NULL DEFAULT 0
      );
      
      INSERT INTO Members (username, skin, skinLastUpdated) 
      SELECT username, skin, lastUpdated
      FROM MembersOld;

      DROP TABLE MembersOld;`
  },
  {
    version: 2,
    script: `
      CREATE TABLE DiscordMembers (
        discordId TEXT PRIMARY KEY,
        minecraftId TEXT UNIQUE
      );`
  }]

async function migrate(currentVersion: number, targetVersion: number) {
  if (currentVersion == targetVersion) return
  const migration = migrations.find(migration => migration.version == currentVersion + 1)
  if (!migration) {
    throw new Error(`Error: target version is ${targetVersion}, but could not locate migration to ${currentVersion + 1}`)
  }
  db.transaction(() => {
    db.exec(migration.script)
    setDbVersion(currentVersion + 1)
  })()
  migrate(currentVersion + 1, targetVersion)
}

async function runMigrations() {
  const currentVersion = getDbVersion()
  const targetVersion = Math.max(...migrations.map(migration => migration.version))
  if (currentVersion != targetVersion) {
    console.log(`Beginning migrations to version ${targetVersion}...`)
    await db.backup(`./database/backups/members_${currentVersion}_${Date.now()}.db`)
    await migrate(currentVersion, targetVersion)
    console.log(`Completed migrations to version ${targetVersion}.`)
  }
}

if (!databaseExists) {
  const initial = migrations.find(migration => migration.version == 0)?.script
  if (initial != null) {
    db.transaction(() => {
      db.exec(initial)
    })()
  }
}

await runMigrations()

