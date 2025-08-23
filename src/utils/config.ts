import fs from "fs/promises"

export type GuildRole = {
	name: string
	sbLevel: number
	fishingXp: number
	priority: number
}

type Config = {
	minecraft: {
		username: string
		host: string
		port: number
		privilegedUsers: string[]
	}
	discord: {
		guildRequirements: boolean
		token: string
		client: string
		guild: string
		channel: string
		officerChannel: string
		shutdownWebhook: string
		loggerWebhook: string
		verification: {
			channelId: string
			unverifiedRole: string
			verifiedRole: string
		}
	}
	bridge: {
		prefix: string
		apiKey: string
		hypixelGuild: string
	}
	proxy: {
		host: string
		port: number
		type: 4 | 5
		userId: string
		password: string
	}
	roles: {
		hypixelTag: string
		discord: string
		isStaff: boolean
	}[]
	guildRoles: GuildRole[]
	joinRequirements: {
		sbLevel: number
		overflowFishingXp: number
	}[]
	linking?: boolean
	achievementRoles?: boolean
	marketApiUrl: string
}

export let config = JSON.parse(await fs.readFile("./src/config.json", "utf-8")) as Config
