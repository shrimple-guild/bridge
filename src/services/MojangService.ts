import sharp from "sharp"
import SQL from "sql-template-strings"
import PostgresPool from "../database/Pool.js"

type UserQueryResult = APIMinecraftUserData & { is_expired: boolean }

type MinecraftUserData = {
  id: string,
  name: string,
  skin: Buffer,
  cached: boolean
}

type APIMinecraftUserData = {
  id: string,
  name: string,
  skin: string
}

export class MojangService {
  private defaultSkin = "LyANKx4NLx8PKBwLJBgIJhoKKx4NKh0NKx4NKx4NKx4NMyQRQioSPyoVLB4OKBwLKx4NtolsvY5yxpaAvYtyvY50rHZaNCUSqn1mtIRtqn1mrYBtnHJcu4lynGlMnGlMtIRt////Uj2JtXtnu4lyUj2J////qn1mnGNGs3tit4JyakAwakAwvohsompHgFM0kF5Dll9Ad0I1d0I1d0I1d0I1j14+gVM5b0UsbUMqgVM5gVM5ek4zg1U7g1U7ek4z"

  constructor(private pool: PostgresPool) {}

  async fetchUserData(name: string): Promise<MinecraftUserData> {
    const cached = await this.fetchUserDataFromDatabase(name)

    if (cached && !cached.is_expired) return MojangService.toBuffer(cached, true)

    try {
      const api = await this.fetchUserDataFromAPI(name)
      await this.insertUserData(api)
      return MojangService.toBuffer(api, false)
    } catch (e) {
      if (cached) {
        return MojangService.toBuffer(cached, true)
      } else {
        throw e
      }
    }
  }

  private async fetchUserDataFromDatabase(name: string): Promise<UserQueryResult | undefined> {
    return this.pool.query<UserQueryResult>(SQL`
      SELECT id, name, skin, age(now(), updated) > '1 day' AS is_expired
      FROM minecraft_players WHERE lower(name) = lower(${name});
    `).then(result => result.rows.at(0));
  }


  private async insertUserData(result: APIMinecraftUserData) {
    await this.pool.query(SQL`
      INSERT INTO minecraft_players (id, name, skin)
      VALUES (${result.id}, ${result.name}, ${result.skin})
      ON CONFLICT (id) DO UPDATE SET 
        name = excluded.name,
        updated = excluded.updated,
        update_count = minecraft_players.update_count + 1;
    `)
  }
  
  private async fetchUserDataFromAPI(username: string): Promise<APIMinecraftUserData> {
    const url = new URL(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    const mojangResponse = await fetch(url)
    if (mojangResponse.status != 200) {
      if (mojangResponse.ok) throw new Error(`Invalid name.`)
      throw new Error(`Mojang API returned ${mojangResponse.statusText}`)
    }
    const { id, name } = await mojangResponse.json() 
    const profileResponse = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${id}`)
    if (profileResponse.status !== 200) {
      throw new Error(`Mojang API returned code ${profileResponse.status} while getting profile data for ${id}.`)
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

    return {
      id: id,
      name: name,
      skin: data.toString("base64") ?? this.defaultSkin
    }
  }

  private static async getSkinPng(data: string): Promise<Buffer> {
    const array = new Uint8ClampedArray(Buffer.from(data, "base64"))
    return await sharp(array, {raw: {width: 8, height: 8, channels: 3}})
      .resize(128, 128, { kernel: sharp.kernel.nearest })
      .png()
      .toBuffer()
  }

  private static async toBuffer(result: APIMinecraftUserData, cached: boolean): Promise<MinecraftUserData> {
    return { 
      id: result.id, 
      name: result.name, 
      skin: await MojangService.getSkinPng(result.skin),
      cached: cached
    }
  }
}




