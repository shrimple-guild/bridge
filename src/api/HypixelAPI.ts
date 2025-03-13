import { Database } from "../database/database.js"
import { LoggerCategory } from "../utils/Logger.js"
import { Bazaar } from "./Bazaar.js"
import { CollectionCategory } from "./CollectionTypes.js"
import { FarmingContests } from "./FarmingContests.js"
import { HypixelAPIError } from "./HypixelAPIError.js"
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
	collections?: CollectionCategory[]

	constructor(
		private apiKey: string,
		private database: Database,
		private logger: LoggerCategory
	) {
		this.mojang = new MojangAPI(database)
	}

	async init(specifiedNames?: SpecifiedNames) {
		const items = await SkyblockItems.create(this, specifiedNames)
		this.bazaar = new Bazaar(this, items, this.logger)
		this.contests = await FarmingContests.create(this.logger)
		this.collections = await this.fetchCollections()
		this.logger.info("Hypixel API initialized.")
	}

	async fetchPlayer(uuid: string): Promise<HypixelPlayer> {
		const { data } = await this.fetchHypixel("/player", {
			uuid: uuid,
			key: this.apiKey
		})
		if (data.player == null) throw new Error(`This player has not joined Hypixel!`)
		return new HypixelPlayer(data.player)
	}

	async fetchProfiles(uuid: string): Promise<SkyblockProfiles> {
		const uuidTrimmed = uuid.replaceAll("-", "")
		const { data } = await this.fetchHypixel("/skyblock/profiles", {
			uuid: uuidTrimmed,
			key: this.apiKey
		})
		if (data.profiles == null || data.profiles.length == 0) {
			throw new Error(`This player has not joined SkyBlock!`)
		}
		return new SkyblockProfiles(data.profiles, uuidTrimmed, this)
	}

	async fetchGuildMembers(guildId: string): Promise<HypixelGuildMember[]> {
		const { data } = await this.fetchHypixel("/guild", {
			id: guildId,
			key: this.apiKey
		})
		if (!data.guild) throw new Error(`This guild does not exist!`)
		const members = data.guild.members as any[]
		return members.map((member) => new HypixelGuildMember(member, this))
	}

	private async fetchCollections(): Promise<CollectionCategory[]> {
		const { data } = await this.fetchHypixel("/resources/skyblock/collections")
		return Object.entries(data.collections).map(([k, v]) => {
			const items = Object.entries((v as any).items).map(([k, v]) => {
				const item = v as any
				return {
					id: k,
					name: item.name,
					maxTier: item.maxTiers,
					tiers: item.tiers
				}
			})
			return {
				id: k,
				items: items
			}
		})
	}

	async fetchElections(): Promise<ElectionResponse> {
		const { data } = await this.fetchHypixel("/resources/skyblock/election")
		return data as ElectionResponse
	}

	async fetchHypixel(
		endpoint: string,
		parameters: { [key: string]: string } = {}
	): Promise<HypixelResponse> {
		let url = new URL("https://api.hypixel.net")
		url.pathname = `/v2${endpoint}`
		url.search = new URLSearchParams(parameters).toString()
		const response = await fetchWithTimeout(url)
		if (response.status == 200) {
			return {
				data: await response.json(),
				headers: {
					rateLimit: parseInt(response.headers.get("ratelimit-limit") ?? "0"),
					rateLimitRemaining: parseInt(
						response.headers.get("ratelimit-remaining") ?? "0"
					),
					rateLimitReset: parseInt(response.headers.get("ratelimit-reset") ?? "0")
				}
			}
		} else {
			throw new HypixelAPIError(response.status, response.statusText)
		}
	}
}

export async function fetchWithTimeout(url: URL) {
	try {
		return await fetch(url, {
			signal: AbortSignal.timeout(maxRequestTime * 1000)
		})
	} catch (e) {
		throw new Error(`Request timed out.`)
	}
}

type HypixelResponse = {
	data: any
	headers: {
		rateLimit: number
		rateLimitRemaining: number
		rateLimitReset: number
	}
}
