import { apiKey } from "./Utils.js";

const maxRequestTime = 3

async function fetchWithTimeout(url: URL) {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(maxRequestTime * 1000) })
  } catch (e) {
    throw new Error(`Request timed out.`)
  }
}

export async function fetchHypixel(endpoint: string, parameters: {[key: string]: string}): Promise<any> {
  let url = new URL("https://api.hypixel.net")
  url.pathname = endpoint
  url.search = (new URLSearchParams(parameters)).toString()
  const response = await fetchWithTimeout(url)
  if (response.status == 200) {
    return response.json()
  } else {
    throw new Error(`Hypixel API returned status ${response.status} ${response.statusText}`)
  }
}

export async function fetchUuid(username: string): Promise<string> {
  const url = new URL(`https://api.mojang.com/users/profiles/minecraft/${username}`)
  const mojangResponse = await fetchWithTimeout(url)
  if (mojangResponse.status == 200) return (await mojangResponse.json()).id as string
  if (mojangResponse.ok) throw new Error(`Invalid username.`)
  throw new Error(`Mojang API returned ${mojangResponse.statusText}`)
}

export async function fetchPlayer(uuid: string) {
 const response = await fetchHypixel("/player", { uuid: uuid, key: apiKey}) as any
 if (response.player == null) throw new Error(`This player has not joined Hypixel!`)
 return response.player
}


export async function fetchProfiles(uuid: string): Promise<any[]> {
  const response = await fetchHypixel("/skyblock/profiles", { uuid: uuid, key: apiKey}) as any
 if (response.profiles == null || response.profiles.length == 0) {
  throw new Error(`This player has not joined SkyBlock!`)
 }
 return response.profiles
}

