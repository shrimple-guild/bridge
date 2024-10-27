import { SimpleCommandManager } from "./commands/SimpleCommandManager.js";
import { DiscordBot } from "../discord/discordBot.js";
import { MinecraftBot } from "../minecraft/MinecraftBot.js";
import { sleep } from "../utils/utils.js";
import { LoggerCategory } from "../utils/Logger.js";

export class Bridge {
	constructor(
		public discord: DiscordBot,
		private minecraft: MinecraftBot,
		private commandManager: SimpleCommandManager,
		private logger: LoggerCategory
	) {
		minecraft.bridge = this;
		discord.bridge = this;
		commandManager.addBridgeCommands(this);
	}

	async onMinecraftChat(
		username: string,
		content: string,
		isStaff: boolean,
		colorAlias?: string,
		guildRank?: string
	) {
		await Promise.all([
			this.discord.sendGuildChatEmbed(username, content, colorAlias, guildRank),
			this.handleCommand(content, isStaff, false, username)
		]);
	}

	async onDiscordChat(
		author: string,
		content: string,
		isStaff: boolean,
		replyAuthor: string | undefined
	) {
		const replyString = replyAuthor ? ` [to] ${replyAuthor}` : "";
		const message = `${author}${replyString}: ${content}`;
		await Promise.all([
			this.minecraft.chat(message),
			this.handleCommand(content, isStaff, true)
		]);
	}

	async handleCommand(content: string, isStaff: boolean, isDiscord: boolean, username?: string) {
		const response = await this.commandManager.execute(content, isStaff, isDiscord, username).catch((e) => `⚠ ${e}`);

		if (response) {
			if (response.startsWith("Pong!")) this.minecraft.chat(`/gc ${response}`);
			else await this.chatAsBot(response);
		}
	}

	async chatMinecraftRaw(content: string, priority?: number) {
		this.minecraft.chatRaw(content, priority);
	}

	async chatAsBot(content: string, priority?: number) {
		await Promise.all([
			this.minecraft.chat(content, priority),
			this.discord.sendGuildChatEmbed(this.minecraft.username, content?.replace(/<@[^>]+>$/g, "")?.trim(), "BOT")
		]);
	}

	async onMinecraftJoinLeave(username: string, action: "joined" | "left") {
		await this.discord.sendGuildChatEmbed(
			username,
			`**${action}.**`,
			action.toUpperCase()
		);
	}

	async onBotLeave(reason: string) {
		await this.discord.sendSimpleEmbed(
			this.minecraft.username,
			"❌ Bot offline.",
			reason
		);
	}

	async onBotJoin() {
		await this.discord.sendSimpleEmbed(
			this.minecraft.username,
			"✅ Bot online."
		);
	}

	async quit() {
		this.minecraft.quit();
	}

	isBotOnline() {
		return this.minecraft.getStatus();
	}

	async reload() {
		await this.quit();
		await sleep(2000);
		this.minecraft.connect(this.minecraft.username);
	}
}
