import { Statement } from "better-sqlite3"
import sharp from "sharp"
import { Player } from "../structures/Player.js"

export class MojangAPI {

  private defaultSkin = "LyANKx4NLx8PKBwLJBgIJhoKKx4NKh0NKx4NKx4NKx4NMyQRQioSPyoVLB4OKBwLKx4NtolsvY5yxpaAvYtyvY50rHZaNCUSqn1mtIRtqn1mrYBtnHJcu4lynGlMnGlMtIRt////Uj2JtXtnu4lyUj2J////qn1mnGNGs3tit4JyakAwakAwvohsompHgFM0kF5Dll9Ad0I1d0I1d0I1d0I1j14+gVM5b0UsbUMqgVM5gVM5ek4zg1U7g1U7ek4z"
  private skinTimeout = 60 * 1000
  private uuidTimeout = 86400 * 1000

  async fetchPlayer(username: string) {
    const uuid = await this.fetchUuid(username)
    const skin = await this.fetchSkin(uuid)
    return new Player(uuid, username, skin)
  }

  private async fetchSkin(uuid: string): Promise<string> {
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
  
  private async fetchUuid(username: string): Promise<string> {
    const url = new URL(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    const mojangResponse = await fetch(url)
    if (mojangResponse.status == 200) return (await mojangResponse.json()).id as string
    if (mojangResponse.ok) throw new Error(`Invalid username.`)
    throw new Error(`Mojang API returned ${mojangResponse.statusText}`)
  }
}




