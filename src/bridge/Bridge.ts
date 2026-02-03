import { SimpleCommandManager } from "./commands/SimpleCommandManager.js"
import { DiscordBot } from "../discord/DiscordBot.js"
import { MinecraftBot } from "../minecraft/MinecraftBot.js"
import { MessageSource, sleep } from "../utils/utils.js"
import { LoggerCategory } from "../utils/Logger.js"

export class Bridge {
	constructor(
		public discord: DiscordBot,
		public minecraft: MinecraftBot,
		private commandManager: SimpleCommandManager,
		private logger: LoggerCategory,
		private discordChannelId: string,
		private officerDiscordChannelId: string
	) {
		minecraft.bridge = this
		discord.bridge = this
		commandManager.addBridgeCommands(this)
	}

	getDiscordChannelId(source: MessageSource) {
		if (source === MessageSource.Raw) {
			source = this.minecraft.lastSource ?? source
		}
		return source === MessageSource.Staff ? this.officerDiscordChannelId : this.discordChannelId
	}

	getDiscordMessageSource(channelId: string) {
		if (channelId === this.officerDiscordChannelId) return MessageSource.Staff
		else if (channelId === this.discordChannelId) return MessageSource.Guild
		return undefined
	}

	async onMinecraftChat(
		source: MessageSource,
		username: string,
		content: string,
		isStaff: boolean,
		colorAlias?: string,
		guildRank?: string
	) {
		await Promise.all([
			this.discord.sendGuildChatEmbed(source, username, content, colorAlias, guildRank),
			this.handleCommand(source, content, isStaff, false, username)
		])
	}

	async onDiscordChat(
		source: MessageSource,
		author: string,
		content: string,
		isStaff: boolean,
		replyAuthor: string | undefined
	) {
		const replyString = replyAuthor ? ` [to] ${replyAuthor}` : ""
		const message = `${author}${replyString}: ${content}`
		await Promise.all([
			this.minecraft.chat(source, message),
			this.handleCommand(source, content, isStaff, true)
		])
	}

	async handleCommand(source: MessageSource, content: string, isStaff: boolean, isDiscord: boolean, username?: string) {
		const response = await this.commandManager
			.execute(content, isStaff, isDiscord, username)
			.catch((e) => `⚠ ${e}`)

		if (response) {
			if (response.startsWith("Pong!")) this.minecraft.chat(source, response)
			else await this.chatAsBot(source, response)
		}
	}

	async chatMinecraftRaw(source: MessageSource, content: string, priority?: number) {
		this.minecraft.chatRaw(source, content, priority)
	}

	async chatAsBot(source: MessageSource, content: string, priority?: number) {
		await Promise.all([
			this.minecraft.chat(source, content, priority),
			this.discord.sendGuildChatEmbed(
				source,
				this.minecraft.username,
				content?.replace(/<@[^>]+>$/g, "")?.trim(),
				"BOT"
			)
		])
	}

	async onMinecraftJoinLeave(username: string, action: "joined" | "left") {
		await this.discord.sendGuildChatEmbed(MessageSource.Guild, username, `**${action}.**`, action.toUpperCase())
	}

	async onBotLeave(reason: string) {
		await this.discord.sendSimpleEmbed(MessageSource.Guild, this.minecraft.username, "❌ Bot offline.", reason)
	}

	async onBotJoin() {
		await this.discord.sendSimpleEmbed(MessageSource.Guild, this.minecraft.username, "✅ Bot online.")
	}

	async quit() {
		this.minecraft.quit()
	}

	isBotOnline() {
		return this.minecraft.getStatus()
	}

	async reload() {
		await this.quit()
		await sleep(2000)
		this.minecraft.connect(this.minecraft.username)
	}
}
