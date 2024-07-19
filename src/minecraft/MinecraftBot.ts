import AsyncLock from "async-lock";
import mineflayer from "mineflayer";
import { Bridge } from "../bridge/Bridge.js";
import { sleep } from "../utils/utils.js";
import { PatternManager } from "./PatternManager.js";
import { LoggerCategory } from "../utils/Logger.js";
import { config } from "../utils/config.js";
import pThrottle from "p-throttle";

export class MinecraftBot {
	bridge?: Bridge;

	private bot: mineflayer.Bot;
	private status: "online" | "offline" = "offline";
	private retries: number = 0;
	private spamProtectionLastSent: number = 0;
	private chatDelay = 1000;
	private throttle = pThrottle({
		strict: true,
		interval: 1000,
		limit: 1
	});

	constructor(
		readonly username: string,
		private privilegedUsers?: string[],
		private logger?: LoggerCategory
	) {
		this.bot = this.connect(username);
	}

	getStatus() {
		return this.status == "online";
	}

	connect(username: string) {
		this.logger?.info("Connecting...");
		const bot = mineflayer.createBot({
			host: "mc.hypixel.net",
			port: 25565,
			username: username,
			chatLengthLimit: 256,
			auth: "microsoft",
			version: "1.17.1",
			checkTimeoutInterval: 10000
		});
		bot.on("messagestr", (chat) => this.onChat(chat));
		bot.on("end", (reason) => this.onEnd(reason));
		bot.once("spawn", () => this.onSpawn());
		this.bot = bot;
		return bot;
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
		this.logger?.info("Bot online.");
		this.status = "online";
		this.retries = 0;
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
			let i = 0;
			for (const chunk of split) {
				const msg = i > 0 && chunk.startsWith("/") ? `.${chunk}` : chunk;
				this.chatRaw(msg, priority);
				i++;
			}
		}
	}

	chatRaw(msg: string, priority?: number) {
		this.throttle(() => {
			this.bot?.chat(msg);
		})();
	}

	async onEnd(reason: string) {
		this.logger?.warn(`Disconnected (reason: ${reason}).`);
		if (this.status == "online") await this.bridge?.onBotLeave(reason);
		this.status = "offline";
		if (reason != "disconnect.quitting") {
			const waitTime = Math.min(
				1000 * Math.pow(2, this.retries),
				60 * 10 * 1000
			);
			await sleep(waitTime);
			try {
				this.connect(this.username);
			} catch (e) {
				await sleep(waitTime);
				this.connect(this.username);
				console.error(e);
			}
			this.retries++;
			if (this.retries > 10) {
				this.logger?.error("Failed to connect after 10 attempts. Quitting.");
				process.exit(1);
			}
		}
	}

	async onSpawn() {
		this.chat("§");
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
