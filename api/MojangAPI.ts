import sharp from "sharp"

export class MojangAPI {

  async fetchSkin(uuid: string): Promise<string> {
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
  
  async fetchUuid(username: string): Promise<string> {
    const url = new URL(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    const mojangResponse = await fetch(url)
    if (mojangResponse.status == 200) return (await mojangResponse.json()).id as string
    if (mojangResponse.ok) throw new Error(`Invalid username.`)
    throw new Error(`Mojang API returned ${mojangResponse.statusText}`)
  }
}