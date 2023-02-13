import { fetchWithTimeout } from "../utils/fetchUtils.js"
import { HypixelGuildMember } from "./HypixelGuildMember.js"
import { HypixelPlayer } from "./HypixelPlayer.js"
import { MojangAPI } from "./MojangAPI.js"
import { SkyblockProfiles } from "./SkyblockProfiles.js"

export class HypixelAPI {
  private apiKey: string
  readonly mojang = new MojangAPI()

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async fetchPlayer(uuid: string): Promise<HypixelPlayer> {
    const response = await fetchHypixel("/player", { uuid: uuid, key: this.apiKey}) as any
    if (response.player == null) throw new Error(`This player has not joined Hypixel!`)
    return new HypixelPlayer(response.player)
  }
  
  async fetchProfiles(uuid: string): Promise<SkyblockProfiles> {
    const uuidTrimmed = uuid.replaceAll("-", "")
    const response = await fetchHypixel("/skyblock/profiles", { uuid: uuidTrimmed, key: this.apiKey}) as any
    if (response.profiles == null || response.profiles.length == 0) {
      throw new Error(`This player has not joined SkyBlock!`)
    }
    return new SkyblockProfiles(response.profiles, uuidTrimmed)
  }
  
  async fetchGuildMembers(guildId: string): Promise<HypixelGuildMember[]> {
    const response = await fetchHypixel("/guild", { id: guildId, key: this.apiKey}) as any
    if (!response.guild) throw new Error(`This guild does not exist!`)
    const members = response.guild.members as any[]
    return members.map(member => new HypixelGuildMember(member))
  }
}

async function fetchHypixel(endpoint: string, parameters: {[key: string]: string}): Promise<any> {
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