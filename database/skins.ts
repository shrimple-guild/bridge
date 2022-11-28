import Database from "better-sqlite3"
import { getMinecraftAvatar, steve } from "../utils/SkinUtils.js"

const db = new Database("./data/members.db")
const timeout = 60 * 5 * 1000

db.prepare(`
CREATE TABLE IF NOT EXISTS Members (
  username TEXT PRIMARY KEY,
  skin TEXT NOT NULL,
  lastUpdated INTEGER NOT NULL
)
`).run()

const skinSelect = db.prepare(`
SELECT skin, lastUpdated
FROM Members
WHERE username = ?
`)

const insertSkin = db.prepare(`
INSERT OR REPLACE INTO Members 
VALUES (:username, :skin, :lastUpdated)
`)

export async function getSkin(username: string): Promise<string | undefined> {
  let { skin, lastUpdated } = skinSelect.get(username) ?? {}
  if (!skin || (Date.now() - lastUpdated) > timeout) {
    skin = await updateSkin(username)
  }
  return skin ?? steve
}

async function updateSkin(username: string): Promise<string | undefined> {
  const skin = await getMinecraftAvatar(username)
  if (!skin) return
  insertSkin.run({ username: username, skin: skin, lastUpdated: Date.now() })
  return skin
}
