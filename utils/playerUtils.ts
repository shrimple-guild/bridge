import sharp from "sharp"
import { fetchWithTimeout } from "../api/HypixelAPI.js"
import { db } from "../database/database.js"

const steve = getSkinPng("LyANKx4NLx8PKBwLJBgIJhoKKx4NKh0NKx4NKx4NKx4NMyQRQioSPyoVLB4OKBwLKx4NtolsvY5yxpaAvYtyvY50rHZaNCUSqn1mtIRtqn1mrYBtnHJcu4lynGlMnGlMtIRt////Uj2JtXtnu4lyUj2J////qn1mnGNGs3tit4JyakAwakAwvohsompHgFM0kF5Dll9Ad0I1d0I1d0I1d0I1j14+gVM5b0UsbUMqgVM5gVM5ek4zg1U7g1U7ek4z")
const skinTimeout = 60 * 1000
const uuidTimeout = 86400 * 1000

const skinSelect = db.prepare(`
SELECT skin, skinLastUpdated AS lastUpdated
FROM Members
WHERE username = ?
`)

const uuidSelect = db.prepare(`
SELECT uuid, uuidLastUpdated AS lastUpdated
FROM Members
WHERE username = ?
`)

const uuidUpsert = db.prepare(`
INSERT INTO Members (username, uuid, uuidLastUpdated)
VALUES (:username, :uuid, :lastUpdated)
ON CONFLICT (username) DO UPDATE SET
uuid = excluded.uuid,
uuidLastUpdated = excluded.uuidLastUpdated
`)

const skinUpsert = db.prepare(`
INSERT INTO Members (username, skin, skinLastUpdated)
VALUES (:username, :skin, :lastUpdated)
ON CONFLICT (username) DO UPDATE SET
skin = excluded.skin,
skinLastUpdated = excluded.skinLastUpdated
`)

const nameInDB = db.prepare(`
SELECT username
FROM Members
WHERE username = ?
`)

const selectSkin = (uuid: string) => {
  const data = uuidSelect.get(uuid) 
  return {
    skin: (data?.skin ?? undefined) as string | undefined,
    lastUpdated: (data?.lastUpdated ?? 0) as number
  }
}

const selectUuid = (username: string) => {
  const data = uuidSelect.get(username) 
  return {
    uuid: (data?.uuid ?? undefined) as string | undefined,
    lastUpdated: (data?.lastUpdated ?? 0) as number
  }
}

async function fetchSkinFromAPI(uuid: string): Promise<string> {
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

async function fetchUuidFromAPI(username: string): Promise<string> {
  const url = new URL(`https://api.mojang.com/users/profiles/minecraft/${username}`)
  const mojangResponse = await fetchWithTimeout(url)
  if (mojangResponse.status == 200) return (await mojangResponse.json()).id as string
  if (mojangResponse.ok) throw new Error(`Invalid username.`)
  throw new Error(`Mojang API returned ${mojangResponse.statusText}`)
}


export async function fetchUuid(username: string) {
  const { uuid: cachedUuid, lastUpdated } = selectUuid(username)
  if (cachedUuid == null || (Date.now() - lastUpdated) > uuidTimeout) {
    const uuid = await fetchUuidFromAPI(username)
    uuidUpsert.run({ username: username, uuid: uuid, lastUpdated: Date.now() })
    return uuid
  }
  return cachedUuid
}

export async function fetchSkin(username: string) {
  try {
    const { skin, lastUpdated } = selectSkin(username)
    if (!skin || (Date.now() - lastUpdated) > skinTimeout) {
      const uuid = await fetchUuid(username)
      const skin = await fetchSkinFromAPI(uuid)
      skinUpsert.run({ username: username, skin: skin, lastUpdated: Date.now() })
      return getSkinPng(skin)
    }
    return getSkinPng(skin)
  } catch (e) {
    console.error(e)
    return steve
  }
}

async function getSkinPng(data: string): Promise<Buffer> {
  const array = new Uint8ClampedArray(Buffer.from(data, "base64"))
  return await sharp(array, {raw: {width: 8, height: 8, channels: 3}})
    .resize(128, 128, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer()
}

export function nameIsInDb(username: string): boolean {
  return nameInDB.get(username) != null
}