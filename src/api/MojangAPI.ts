import { Statement } from "better-sqlite3"
import { Database } from "../database/database"

type UUIDResponse = {
  id: string
  lastUpdated: number
}

export class MojangAPI {

  private steveUUID = "c06f89064c8a49119c29ea1dbd1aab82"

  private selectSkin: Statement
  private selectUuid: Statement
  private deleteName: Statement
  private upsertName: Statement
  private upsertSkin: Statement

  constructor(db: Database) {
    this.selectSkin = db.prepare(`SELECT skin, skinLastUpdated AS lastUpdated FROM Players WHERE name = ?`)

    this.selectUuid = db.prepare(`SELECT id, nameLastUpdated AS lastUpdated FROM Players WHERE name = ?`)

    this.upsertName = db.prepare(`
      INSERT INTO Players (id, name, nameLastUpdated)
      VALUES (:id, :name, :lastUpdated)
      ON CONFLICT (id) DO UPDATE SET
      name = excluded.name,
      namelastUpdated = excluded.nameLastUpdated
    `)

    this.deleteName = db.prepare(`
      DELETE FROM Players
      WHERE name = ?
    `)

    this.upsertSkin = db.prepare(`
      INSERT INTO Players (id, skin, skinLastUpdated)
      VALUES (:id, :skin, :lastUpdated)
      ON CONFLICT (id) DO UPDATE SET
      skin = excluded.skin,
      skinLastUpdated = excluded.skinLastUpdated
    `)
  }

  async fetchUuid(username: string) {
    const data = this.selectUuid.all(username) as UUIDResponse[]
    let cachedUuid: string | undefined
    // let lastUpdated = 0
    if (data.length > 1) {
      this.deleteName.run()
      cachedUuid = undefined
      // lastUpdated = 0
    } else {
      cachedUuid = data[0]?.id ?? undefined
      // lastUpdated = data[0]?.lastUpdated ?? 0 
    }
    try {
      if (!cachedUuid/* || (Date.now() - lastUpdated) > this.uuidTimeout*/) { // We do not need to cache UUIDs, because if someone changes their name, we will get a new UUID anyway.
        const uuid = await this.fetchUuidFromAPI(username)
        this.upsertName.run({ id: uuid, name: username, lastUpdated: Date.now() })
        return uuid
      }
    } catch (e) {
      console.error(`Failed to get UUID from Mojang API for ${username}`)
      console.error(e)
    }
    if (!cachedUuid) {
      throw new Error("Failed to get UUID from API, and no cached UUID was found.")
    }
    return cachedUuid
  }

  async fetchSkin(username: string): Promise<string> {
    const uuid = await this.fetchUuid(username).catch(e => this.steveUUID)
    return `https://skins.mcstats.com/face/${uuid}`
  }
  
  private async fetchUuidFromAPI(username: string): Promise<string> {
    const url = new URL(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    const mojangResponse = await fetch(url)
    if (mojangResponse.status == 200) return (await mojangResponse.json()).id as string
    if (mojangResponse.ok) throw new Error(`Invalid username.`)
    throw new Error(`Mojang API returned ${mojangResponse.statusText}`)
  }
}




