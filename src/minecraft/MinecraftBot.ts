import mineflayer from "mineflayer";
import { Bridge } from "../bridge/Bridge.js";
import { sleep, stripColorCodes } from "../utils/utils.js";
import { PatternManager } from "./PatternManager.js";
import { LoggerCategory } from "../utils/Logger.js";
import { config } from "../utils/config.js";
import pThrottle from "p-throttle";
import { gListData } from "../bridge/commands/bridgeCommands/GuildStatusCommands.js";
import { SocksClient } from "socks";
import { Client } from "minecraft-protocol";
import { connect } from "net";
import { resolveSrv, resolve as resolveDns } from "dns";

export class MinecraftBot {
	bridge?: Bridge;

	private bot: mineflayer.Bot;
	private status: "online" | "offline" = "offline";
	private retries: number = 0;
	private spamProtectionLastSent: number = 0;
	private chatDelay = 1000;
	private throttle = pThrottle({
		strict: true,
		interval: this.chatDelay,
		limit: 1
	});

	constructor(
		readonly username: string,
		private logger: LoggerCategory,
		private privilegedUsers?: string[]
	) {
		this.bot = this.connect(username);
	}

	getStatus() {
		return this.status == "online";
	}

	private async resolveDns(hostname: string, thePort: number) {
		return new Promise<{ host: string; port: number }>((resolve, reject) => {
			resolveSrv("_minecraft._tcp." + hostname, (err, addresses) => {
				if (err || !addresses?.length) {
					resolveDns(hostname, (err, addresses) => {
						if (err || !addresses?.length) {
							reject("Ruh roh! Could not resolve hostname.");
						} else {
							resolve({ host: addresses[0], port: thePort });
						}
					});
				} else {
					resolve({ host: addresses[0].name, port: addresses[0].port });
				}
			});
		});
	}

	private connectProxied = async (client: Client) => {
		SocksClient.createConnection({
			proxy: config.proxy,
			command: "connect",
			destination: await this.resolveDns(config.minecraft.host, config.minecraft.port)
		}, (err, info) => {
			if (err) {
				this.logger.error("Failed to connect to proxy. Connecting directly.");
				client.setSocket(connect(config.minecraft.port, config.minecraft.host));
			} else {
				this.logger.info("Connected to proxy.");
				client.setSocket(info!.socket);
				client.emit("connect");
			}
		})
	}

	connect(username: string) {
		this.logger.info("Connecting...");
		const bot = mineflayer.createBot({
			connect: config.proxy ? this.connectProxied : undefined,
			host: config.minecraft.host,
			port: config.minecraft.port,
			username: username,
			chatLengthLimit: 256,
			auth: "microsoft",
			version: "1.8.9",
			checkTimeoutInterval: 10000,
		});
		bot.on("message", (raw) => this.onChat(raw.toMotd(), raw.toString()));
		bot.on("end", (reason) => this.onEnd(reason));
		bot.on("kicked", (reason) => this.logger.error(`Kicked: ${reason}`));
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
		this.logger.info("Bot online.");
		this.status = "online";
		this.retries = 0;
		await this.bridge?.onBotJoin();
	}

	onSpamProtection() {
		if (Date.now() - this.spamProtectionLastSent < 120000) return;
		this.chat("⚠ Spam protection moment");
		this.spamProtectionLastSent = Date.now();
	}

	chat(msg: string, priority?: number) {
		for (const chunk of this.splitMsg(msg)) {
			this.chatRaw(chunk, priority);
		}
	}

	splitMsg(msg: string) {
		const split = msg.match(/.{1,254}/g);

		if (!split) return [];
		if (split.length === 1) return split;

		for (let i = 0; i < split.length; i++) {
			if (i === 0 && split.length > 1) {
				split[i] += "➩";
			} else if (i > 0 && i < split.length - 1) {
				split[i] = "➩" + split[i] + "➩";
			} else if (i === split.length - 1 && i > 0) {
				split[i] = "➩" + split[i];
			}
		}

		return split;
	}

	chatRaw(msg: string, priority?: number) {
		this.throttle(() => {
			try {
				this.bot?.chat(msg);
			} catch (e) {
				console.error(e);
			}
		})();
	}

	async onEnd(reason: string) {
		this.logger.warn(`Disconnected (reason: ${reason}).`);
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
				this.logger.error("Failed to connect after 10 attempts. Quitting.");
				process.exit(1);
			}
		}
	}

	async onSpawn() {
		this.chatRaw("/limbo");
		// set values for gListData
		gListData.clear();
		gListData.listening = true;
		this.chatRaw("/g list");
	}

	isPrivileged(username: string) {
		return this.privilegedUsers?.includes(username) ?? false;
	}

	onChat(rawMessage: string, plainMessage: string) {
		void PatternManager.execute(this, rawMessage, plainMessage, this.logger);
	}

	quit() {
		this.bot.quit();
	}
}
