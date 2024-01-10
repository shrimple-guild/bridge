import { Statement } from "better-sqlite3"
import sharp from "sharp"
import { Database } from "../database/database"
import { UUID } from "crypto"

type UUIDResponse = {
  id: string
  lastUpdated: number
}

type SkinResponse = {
  skin: string
  lastUpdated: number
}

export class MojangAPI {

  private defaultSkin = "LyANKx4NLx8PKBwLJBgIJhoKKx4NKh0NKx4NKx4NKx4NMyQRQioSPyoVLB4OKBwLKx4NtolsvY5yxpaAvYtyvY50rHZaNCUSqn1mtIRtqn1mrYBtnHJcu4lynGlMnGlMtIRt////Uj2JtXtnu4lyUj2J////qn1mnGNGs3tit4JyakAwakAwvohsompHgFM0kF5Dll9Ad0I1d0I1d0I1d0I1j14+gVM5b0UsbUMqgVM5gVM5ek4zg1U7g1U7ek4z"
  private skinTimeout = 21600 * 1000
  // private uuidTimeout = 86400 * 1000

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
        console.log("Fetching uuid because " + (!cachedUuid ? "no cached uuid was found" : "of timeout"))
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

  async fetchSkin(username: string) {
    const data = this.selectSkin.all(username) as SkinResponse[]
    let cachedSkin: string | undefined
    let lastUpdated = 0
    if (data.length > 1) {
      this.deleteName.run()
      cachedSkin = undefined
      lastUpdated = 0
    } else {
      cachedSkin = data[0]?.skin ?? undefined
      lastUpdated = data[0]?.lastUpdated ?? 0
    }
    console.log(`Found ${username}'s skin: ${!!cachedSkin}, ${lastUpdated}`)
    try {
      if (!cachedSkin || (Date.now() - lastUpdated) > this.skinTimeout) {
        console.log("Fetching skin because " + (!cachedSkin ? "no cached skin was found" : "of timeout"))
        const uuid = await this.fetchUuid(username)
        if (uuid == null) throw new Error(`Failed to get uuid for ${username}`)
        const skin = await this.fetchSkinFromAPI(uuid)
        this.upsertSkin.run({ id: uuid, skin: skin, lastUpdated: Date.now() })
        return await MojangAPI.getSkinPng(skin)
      }
    } catch (e) {
      console.error(`Failed to get skin from Mojang API for ${username}`)
      console.error(e)
    }
    return await MojangAPI.getSkinPng(cachedSkin ?? this.defaultSkin)
  }

  private async fetchSkinFromAPI(uuid: string): Promise<string> {
    const profileResponse = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
    if (profileResponse.status !== 200) {
      throw new Error(`Mojang API returned code ${profileResponse.status} while getting profile data for ${uuid}.`)
    }
    const content = await profileResponse.json() as any
    const textureUrl = JSON.parse(Buffer.from(content.properties[0].value, "base64").toString("ascii")).textures.SKIN.url
    const textureResponse = await fetch(textureUrl)
    const buffer = new Uint8ClampedArray(await textureResponse.arrayBuffer())
    const helmet = await sharp(buffer).extract({ left: 40, top: 8, width: 8, height: 8 }).toBuffer()
    const data = await sharp(buffer)
      .extract({ left: 8, top: 8, width: 8, height: 8 })
      .composite([{ input: helmet }])
      .removeAlpha()
      .raw()
      .toBuffer()
    return data.toString("base64")
  }
  
  private async fetchUuidFromAPI(username: string): Promise<string> {
    const url = new URL(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    const mojangResponse = await fetch(url)
    if (mojangResponse.status == 200) return (await mojangResponse.json()).id as string
    if (mojangResponse.ok) throw new Error(`Invalid username.`)
    throw new Error(`Mojang API returned ${mojangResponse.statusText}`)
  }

  private static async getSkinPng(data: string): Promise<Buffer> {
    const array = new Uint8ClampedArray(Buffer.from(data, "base64"))
    return await sharp(array, {raw: {width: 8, height: 8, channels: 3}})
      .resize(128, 128, { kernel: sharp.kernel.nearest })
      .png()
      .toBuffer()
  }
}




