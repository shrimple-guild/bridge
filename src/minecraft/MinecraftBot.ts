import { Bridge } from "../bridge/Bridge.js";
import { PatternManager } from "./PatternManager.js";
import { LoggerCategory } from "../utils/Logger.js";
import { config } from "../utils/config.js";
import pThrottle from "p-throttle";
import { IMineflayerBot } from "./IMineflayerBot.js";

export class MinecraftBot {
	bridge?: Bridge;

	private bot: IMineflayerBot;
	private spamProtectionLastSent: number = 0;
	private throttle = pThrottle({
		strict: true,
		interval: 1000,
		limit: 1
	});

	constructor(
		bot: IMineflayerBot,
		readonly username: string,
		private privilegedUsers?: string[],
		private logger?: LoggerCategory
	) {
		this.bot = bot;

		this.bot.on("spawn", () => {
			void this.setOnline();
		});

		this.bot.on("messagestr", (message) => {
			this.onChat(message);
		});

		this.bot.on("end", (reason) => {
			void this.onEnd(reason);
		});
	}

	getStatus() {
		return this.bot.isOnline;
	}

	reconnect() {
		return this.bot.tryReloadBot();
	}

	async sendToBridge(
		username: string,
		content: string,
		colorAlias?: string,
		guildRank?: string
	) {
		await this.bridge?.onMinecraftChat(
			username,
			content,
			this.isStaff(guildRank),
			colorAlias,
			guildRank
		);
	}

	isStaff(guildRank?: string) {
		return guildRank
			? config.roles
					.filter((role) => role.isStaff)
					.map((role) => role.hypixelTag)
					?.includes(guildRank) ?? false
			: false;
	}

	async setOnline() {
		await this.bridge?.onBotJoin();
	}

	onSpamProtection() {
		if (Date.now() - this.spamProtectionLastSent < 120000) return;
		this.chat("Spam protection moment");
		this.spamProtectionLastSent = Date.now();
	}

	chat(msg: string, priority?: number) {
		const split = msg.match(/.{1,256}/g);
		if (split) {
			for (const chunk of split) {
				this.chatRaw(chunk, priority);
			}
		}
	}

	chatRaw(msg: string, priority?: number) {
		return this.throttle(() => {
			this.bot?.chat(msg);
		});
	}

	async onEnd(reason: string) {
		await this.bridge?.onBotLeave(reason);
	}

	isPrivileged(username: string) {
		return this.privilegedUsers?.includes(username) ?? false;
	}

	onChat(message: string) {
		const matchedPattern = PatternManager.execute(this, message, this.logger);
	}

	quit() {
		this.bot.quit();
	}
}
