import { EventEmitter } from "events";
import mineflayer from "mineflayer";
import pRetry from "p-retry";
import { IMineflayerBot } from "./IMineflayerBot";

function debug(message: string) {
	console.log(message);
}

class ReconnectingBot extends EventEmitter implements IMineflayerBot {
	private bot: mineflayer.Bot;
	private online: boolean = true;

	// Create bot.
	static async create(username: string): Promise<ReconnectingBot> {
		const bot = await createBotWithRetry(username);
		const reconnectingBot = new ReconnectingBot(bot);
		return reconnectingBot;
	}

	// Sets up bot with the listeners needed for bridge.
	private setupBot(bot: mineflayer.Bot) {
		debug(`[BOT] Setting up bot.`);
		this.online = true;
		this.emit("spawn");

		bot.on("messagestr", async (message) => {
			debug(`[BOT] Received message: ${message}`);
			this.emit("messagestr", message);
		});

		bot.once("end", async (reason) => {
			debug(`[BOT] Disconnected: ${reason}`);
			this.online = false;
			this.emit("end");
			if (reason != "disconnect.quitting") {
				debug(`[BOT] Attempting to reconnect.`);
				await this.tryReloadBot();
			}
		});

		bot.on("error", async (error) => {
			debug(`[BOT] Error while bot running.`);
			this.online = false;
			this.emit("end");
			// no auto-reconnect logic as this seems extremely rare
		});
		return bot;
	}

	chat(msg: string): void {
		this.bot.chat(msg);
	}

	quit(): void {
		this.bot.quit();
	}

	isOnline(): boolean {
		return this.online;
	}

	// Constructor using a bot which has already been initialized and setup.
	private constructor(bot: mineflayer.Bot) {
		super();
		this.bot = this.setupBot(bot);
	}

	async tryReloadBot() {
		try {
			this.bot.quit();
			const bot = await createBotWithRetry(this.bot.username);
			this.bot = this.setupBot(bot);
		} catch (e) {
			debug(`[BOT] Error while reloading bot.`);
			console.error(e);
		}
	}
}

// Creates a bot in Limbo, retrying up to 10 times as needed.
// Fulfills only once the bot is in Limbo. Bot has all listeners removed before being returned.
async function createBotWithRetry(username: string): Promise<mineflayer.Bot> {
	return pRetry(() => createBot(username), {
		retries: 10,
		maxTimeout: 60_000,
		factor: 2,
		onFailedAttempt: (error) => {
			debug(`[STARTUP] Creating bot failed on attempt ${error.attemptNumber}`);
		}
	});
}

// Creates a Hypixel bot that immediately enters Limbo.
// Fulfills only once the bot is in Limbo. Bot has all listeners removed before being returned.
async function createBot(username: string): Promise<mineflayer.Bot> {
	debug(`[STARTUP] Creating bot: ${username}`);

	const limboMessage = "You were spawned in Limbo.";
	const bot = mineflayer.createBot({
		host: "mc.hypixel.net",
		port: 25565,
		username: username,
		chatLengthLimit: 256,
		auth: "microsoft",
		version: "1.17.1",
		checkTimeoutInterval: 10000
	});

	const botPromise: Promise<mineflayer.Bot> = new Promise((resolve, reject) => {
		bot.on("messagestr", async (message) => {
			debug(`[STARTUP] Received message: ${message}`);
			if (message == limboMessage) {
				debug(`[STARTUP] Reached Limbo.`);
				resolve(bot);
			}
		});

		bot.once("end", async (reason) => {
			debug(`[STARTUP] Disconnected: ${reason}`);
			reject(new Error("Bot ended."));
		});

		bot.once("spawn", async () => {
			debug(`[STARTUP] Spawned in Hypixel.`);
			bot.chat("§");
		});

		setTimeout(() => {
			reject(new Error("Timed out."));
		}, 10000);
	});

	try {
		const bot = await botPromise;
		debug(`[STARTUP] Successfully started.`);
		debug(`[STARTUP] Removing startup listeners.`);
		bot.removeAllListeners();
		return bot;
	} catch (e) {
		debug(`[STARTUP] Error on startup: ${e}.`);
		bot.quit();
		throw e;
	}
}

export default ReconnectingBot;
