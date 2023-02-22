import { Database } from "../database/database.js"
import { LoggerCategory } from "../utils/Logger.js"
import { Bazaar } from "./Bazaar.js"
import { FarmingContests } from "./FarmingContests.js"
import { HypixelGuildMember } from "./HypixelGuildMember.js"
import { HypixelPlayer } from "./HypixelPlayer.js"
import { MojangAPI } from "./MojangAPI.js"
import { SkyblockItems, SpecifiedNames } from "./SkyblockItems.js"
import { SkyblockProfiles } from "./SkyblockProfiles.js"

const maxRequestTime = 3

export class HypixelAPI {

  readonly mojang: MojangAPI
  contests?: FarmingContests
  bazaar?: Bazaar

  private rateLimit: number = 60
  private rateLimitRemaining: number = 60
  private rateLimitReset: number = 60

  constructor(
    private apiKey: string,
    private database: Database,
    private logger: LoggerCategory
  ) {
    this.mojang = new MojangAPI(database)
  }

  async init(specifiedNames?: SpecifiedNames) {
    const items = await SkyblockItems.create(this, specifiedNames)
    this.bazaar = await Bazaar.create(this, items, this.logger)
    this.contests = await FarmingContests.create(this.logger)
  }

  async fetchPlayer(uuid: string): Promise<HypixelPlayer> {
    const response = await this.fetchHypixel("/player", { uuid: uuid, key: this.apiKey}) as any
    if (response.player == null) throw new Error(`This player has not joined Hypixel!`)
    return new HypixelPlayer(response.player)
  }
  
  async fetchProfiles(uuid: string): Promise<SkyblockProfiles> {
    const uuidTrimmed = uuid.replaceAll("-", "")
    const response = await this.fetchHypixel("/skyblock/profiles", { uuid: uuidTrimmed, key: this.apiKey}) as any
    if (response.profiles == null || response.profiles.length == 0) {
      throw new Error(`This player has not joined SkyBlock!`)
    }
    return new SkyblockProfiles(response.profiles, uuidTrimmed)
  }
  
  async fetchGuildMembers(guildId: string): Promise<HypixelGuildMember[]> {
    const response = await this.fetchHypixel("/guild", { id: guildId, key: this.apiKey}) as any
    if (!response.guild) throw new Error(`This guild does not exist!`)
    const members = response.guild.members as any[]
    return members.map(member => new HypixelGuildMember(member, this))
  }

  async fetchHypixel(endpoint: string, parameters: {[key: string]: string} = {}): Promise<any> {
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
}

export async function fetchWithTimeout(url: URL) {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(maxRequestTime * 1000) })
  } catch (e) {
    throw new Error(`Request timed out.`)
  }
}

