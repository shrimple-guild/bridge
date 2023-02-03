import Database from "better-sqlite3"
import fs from "fs"
export const db = new Database("./data/members.db")

const getDbVersion = () => db.prepare("PRAGMA user_version").get().user_version
const setDbVersion = (version: number) => db.prepare(`PRAGMA user_version = ${version}`).run()

db.prepare(`
CREATE TABLE IF NOT EXISTS Members (
  username TEXT PRIMARY KEY,
  skin TEXT NOT NULL,
  lastUpdated INTEGER NOT NULL
)
`).run()

async function runMigration() {
  const currentVersion = getDbVersion()
  if (currentVersion == 0) {
    await db.backup(`./data/members_v${currentVersion}_backup_${Date.now()}.db`)
    db.transaction(() => {
      db.exec(`
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

        DROP TABLE MembersOld;

      `)
      setDbVersion(1)
    })()
    console.log("Completed migration to version 1.")
  }
}

await runMigration()
