import { Statement } from "better-sqlite3"
import { Database } from "../database/database"
import { ONE_WEEK_MS, ONE_HOUR_MS } from "../utils/utils.js"

type UUIDResponse = {
	id: string
	lastUpdated: number
}

type NameResponse = {
	name: string
	lastUpdated: number
}

export class MojangAPI {
	private steveUUID = "c06f89064c8a49119c29ea1dbd1aab82"

	private selectUuid: Statement
	private selectName: Statement
	private deleteName: Statement
	private upsertName: Statement

	constructor(db: Database) {
		this.selectUuid = db.prepare(
			`SELECT id, nameLastUpdated AS lastUpdated FROM Players WHERE lower(name) = ?`
		)

		this.selectName = db.prepare(
			`SELECT name, nameLastUpdated FROM Players WHERE id = ?`
		)

		this.upsertName = db.prepare(`
     	 	INSERT INTO Players (id, name, nameLastUpdated)
     		VALUES (:id, :name, :lastUpdated)
     		ON CONFLICT (id) DO UPDATE SET
     	 	name = excluded.name,
     		namelastUpdated = excluded.nameLastUpdated
    	`)

		this.deleteName = db.prepare(`DELETE FROM Players WHERE name = ?`)
	}

	async fetchUsername(uuid: string): Promise<string | undefined> {
		const uuidTrimmed = uuid.replace("-", "").toLowerCase()

		const cached = this.selectUuid.get(uuidTrimmed) as NameResponse | undefined;

		if (cached?.name && Date.now() - cached?.lastUpdated < ONE_HOUR_MS) {
			return cached.name
		}
		
		try {
			const username = await this.fetchUsernameFromApi(uuidTrimmed)
			this.upsertName.run({
				id: uuidTrimmed,
				name: username.toLowerCase(),
				lastUpdated: Date.now()
			})
			return username
		} catch (e) {
			console.error(`Failed to get username from Mojang API for ${uuid}`)
			console.error(e)
		}

		if (cached?.name) return cached.name
		throw new Error("Failed to get username from API, and no cached value was found.")
	}


	async fetchUuid(username: string) {
		const lower = username.toLowerCase()

		const data = this.selectUuid.all(lower) as UUIDResponse[]

		let cachedUuid: string | undefined

		if (data.length > 1) {
			this.deleteName.run()
			cachedUuid = undefined
		} else {
			cachedUuid = data[0]?.id
		}

		// Update the cached UUID if it is older than a week
		// fixes issue if the username is now used by another account
		if (cachedUuid && Date.now() - data[0].lastUpdated > ONE_WEEK_MS) {
			this.deleteName.run(lower)
			cachedUuid = undefined
		}

		try {
			if (!cachedUuid) {
				const uuid = await this.fetchUuidFromAPI(lower)
				this.upsertName.run({
					id: uuid,
					name: lower,
					lastUpdated: Date.now()
				})
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

	async fetchSkin(username: string): Promise<string> {
		const uuid = await this.fetchUuid(username).catch((e) => this.steveUUID)
		return `https://skins.mcstats.com/face/${uuid}`
	}

	private async fetchUuidFromAPI(username: string): Promise<string> {
		const url = new URL(`https://api.minecraftservices.com/minecraft/profile/lookup/name/${username}`)
		const mojangResponse = await fetch(url)
		if (mojangResponse.status == 200) return (await mojangResponse.json()).id as string
		if (mojangResponse.ok) throw new Error(`Invalid username.`)
		throw new Error(`Mojang API returned ${mojangResponse.statusText}`)
	}

	private async fetchUsernameFromApi(uuid: string): Promise<string> {
		const url = new URL(`https://api.minecraftservices.com/minecraft/profile/lookup/${uuid}`)
		const mojangResponse = await fetch(url)
		if (mojangResponse.status == 200) return (await mojangResponse.json()).name as string
		if (mojangResponse.status == 404) throw new Error(`Invalid UUID.`)
		throw new Error(`Mojang API returned ${mojangResponse.statusText}`)
	}
}
