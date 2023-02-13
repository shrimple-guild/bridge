import sharp from "sharp"
import { Database, Statement } from "better-sqlite3"
import { HypixelAPI } from "../api/HypixelAPI.js"

const steve = "LyANKx4NLx8PKBwLJBgIJhoKKx4NKh0NKx4NKx4NKx4NMyQRQioSPyoVLB4OKBwLKx4NtolsvY5yxpaAvYtyvY50rHZaNCUSqn1mtIRtqn1mrYBtnHJcu4lynGlMnGlMtIRt////Uj2JtXtnu4lyUj2J////qn1mnGNGs3tit4JyakAwakAwvohsompHgFM0kF5Dll9Ad0I1d0I1d0I1d0I1j14+gVM5b0UsbUMqgVM5gVM5ek4zg1U7g1U7ek4z"
const skinTimeout = 60 * 1000
const uuidTimeout = 86400 * 1000


export class PlayerManager {
  private selectSkin: Statement
  private selectUuid: Statement
  private upsertUuid: Statement
  private upsertSkin: Statement
  private selectUser: Statement

  constructor(private db: Database, private hypixelAPI: HypixelAPI) {
    this.selectSkin = db.prepare(`SELECT skin, skinLastUpdated AS lastUpdated FROM Members WHERE username = ?`)
    this.selectUuid = db.prepare(`SELECT uuid, uuidLastUpdated AS lastUpdated FROM Members WHERE username = ?`)
    this.upsertUuid = db.prepare(`
      INSERT INTO Members (username, uuid, uuidLastUpdated)
      VALUES (:username, :uuid, :lastUpdated)
      ON CONFLICT (username) DO UPDATE SET
      uuid = excluded.uuid,
      uuidLastUpdated = excluded.uuidLastUpdated
    `)
    this.upsertSkin = db.prepare(`
      INSERT INTO Members (username, skin, skinLastUpdated)
      VALUES (:username, :skin, :lastUpdated)
      ON CONFLICT (username) DO UPDATE SET
      skin = excluded.skin,
      skinLastUpdated = excluded.skinLastUpdated
    `)
    this.selectUser = db.prepare(`
      SELECT username
      FROM Members
      WHERE username = ?
    `)
  }

  isPlayerTracked(username: string): boolean {
    return this.selectUser.get(username) != null
  }

  async fetchUuid(username: string) {
    const { uuid: cachedUuid, lastUpdated } = this.getCachedUuid(username)
    try {
      if (cachedUuid == null || (Date.now() - lastUpdated) > uuidTimeout) {
        const uuid = await this.hypixelAPI.mojang.fetchUuid(username)
        this.upsertUuid.run({ username: username, uuid: uuid, lastUpdated: Date.now() })
        return uuid
      }
    } catch (e) {}
    return cachedUuid
  }

  async fetchSkin(username: string) {
    const { skin: cachedSkin, lastUpdated } = this.getCachedSkin(username)
    try {
      if (!cachedSkin || (Date.now() - lastUpdated) > skinTimeout) {
        const uuid = await this.fetchUuid(username)
        if (uuid == null) throw new Error(`Failed to get uuid for ${username}`)
        const skin = await this.hypixelAPI.mojang.fetchSkin(uuid)
        this.upsertSkin.run({ username: username, skin: skin, lastUpdated: Date.now() })
        return getSkinPng(skin)
      }
    } catch (e) {
      console.error(e)
    }
    return getSkinPng(cachedSkin ?? steve)
  }

  private getCachedSkin(uuid: string) {
    const data = this.selectSkin.get(uuid) 
    return {
      skin: (data?.skin ?? undefined) as string | undefined,
      lastUpdated: (data?.lastUpdated ?? 0) as number
    }
  }

  private getCachedUuid(username: string) {
    const data = this.selectUuid.get(username) 
    return {
      uuid: (data?.uuid ?? undefined) as string | undefined,
      lastUpdated: (data?.lastUpdated ?? 0) as number
    }
  }
}
  
async function getSkinPng(data: string): Promise<Buffer> {
  const array = new Uint8ClampedArray(Buffer.from(data, "base64"))
  return await sharp(array, {raw: {width: 8, height: 8, channels: 3}})
    .resize(128, 128, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer()
}