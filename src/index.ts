import { Verification } from "./verify/Verification.js"
import { HypixelAPI } from "./api/HypixelAPI.js"
import { createDiscordBot } from "./discord/DiscordBot.js"
import { SlashCommandManager } from "./discord/commands/SlashCommandManager.js"
import { config } from "./utils/config.js"
import { MinecraftBot } from "./minecraft/MinecraftBot.js"
import { Bridge } from "./bridge/Bridge.js"
import { SimpleCommandManager } from "./bridge/commands/SimpleCommandManager.js"
import { Logger } from "./utils/Logger.js"
import readline from "readline"
import exitHook from "async-exit-hook"
import { Database } from "./database/database.js"
import { migrations } from "./database/migrations.js"
import { postDisconnectEmbed } from "./utils/discordUtils.js"
import { sleep } from "./utils/utils.js"
import { GuildReqsCommand } from "./discord/commands/GuildReqsCommand.js"
import { InteractionRegistry } from "./discord/interactions/InteractionRegistry.js"
import { LinkService } from "./verify/LinkService.js"
import { Achievements } from "./achievements/Achievements.js"
import { MarketApi } from "./api/MarketApi.js"

export const general = Logger.category("General")

const database = await Database.create("./src/database", migrations)

const hypixelAPI = new HypixelAPI(config.bridge.apiKey, database, Logger.category("HypixelAPI"))
await hypixelAPI.init()

const marketApi = new MarketApi(config.marketApiUrl)

const slashCommands = new SlashCommandManager()

if (config.discord.guildRequirements) {
	slashCommands.register(new GuildReqsCommand(hypixelAPI))
}

const interactions = new InteractionRegistry()

const discord = await createDiscordBot(
	config.discord.token,
	slashCommands,
	interactions,
	hypixelAPI,
	Logger.category("Discord")
)

if (config.linking) {
	const linkService = new LinkService(database)

	if (config.discord.verification.channelId.length > 0) {
		// dont wanna bother with checking if i need to check a property, its length, or just the object but this should work
		const verification = new Verification(
			discord.client,
			database,
			hypixelAPI,
			slashCommands,
			interactions,
			linkService
		)

		// TODO remove this, replace with smple boolean
		if (config.discord.verification.unverifiedRole) {
			verification.setVerificationRoles(
				config.discord.guild,
				config.discord.verification.unverifiedRole,
				config.discord.verification.verifiedRole
			)
		}
	}

	const autoRoles = new Achievements(slashCommands, database, hypixelAPI, linkService)
}

await general.info(`
	Starting bot with discord ID ${discord.client.user.id}.
	- Registered ${slashCommands.commands.length} slash commands.
	- Minecraft bot: ${config.minecraft.username}.
`)

const bridgeCommandManager = new SimpleCommandManager(
	hypixelAPI,
	marketApi,
	Logger.category("Commands")
)

const minecraft = new MinecraftBot(
	config.minecraft.username,
	Logger.category("Minecraft"),
	config.minecraft.privilegedUsers
)
const bridge = new Bridge(
	discord,
	minecraft,
	bridgeCommandManager,
	Logger.category("Bridge"),
	config.discord.channel
)

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
} as any)

rl.on("line", async (input) => {
	if (input != "quit") {
		await bridge.chatAsBot(input)
	} else {
		await bridge.quit()
	}
})

exitHook(async (cb) => {
	await postDisconnectEmbed()
	await bridge.chatAsBot("Process ended...")
	await sleep(1000)
	await bridge.quit()
	await sleep(1000)
	cb()
})
