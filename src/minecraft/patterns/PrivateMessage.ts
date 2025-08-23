import { Pattern } from "./Pattern"
import { config } from "../../utils/config.js"
import { MinecraftBot } from "../MinecraftBot"
import fs from "fs/promises"
import { antiSpamProtString, MessageSource, sleep } from "../../utils/utils.js"

export const privateMessage: Pattern = {
	name: "privateMessage",
	pattern: /^From (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): (?<content>.+$)/,
	execute: async (bot, groups) => {
		if (bot.isPrivileged(groups.name)) {
			if (groups.content.startsWith("_config")) {
				const args = groups.content.split(" ")
				if (args[1]?.toLowerCase() == "backup") {
					await backupConfig(bot, groups.name)
				} else if (args[1]?.toLowerCase() == "restore") {
					await restoreConfig(bot, groups.name)
				} else if (args.length == 3) {
					await changeConfig(bot, groups.name, args[1], args[2])
				} else {
					bot.chat(
						MessageSource.Raw,
						`/msg ${groups.name} Invalid usage of _config. ${antiSpamProtString()}`
					)
				}
			} else {
				bot.chat(MessageSource.Guild, groups.content)
				await bot.sendToBridge(MessageSource.Guild, bot.username, groups.content, "BOT")
			}
		}
	}
}

async function changeConfig(
	bot: MinecraftBot,
	sender: string,
	path: string,
	newProperty: string | undefined
) {
	const keys = path.split("/")
	let current = config as any
	for (let i = 0; i < keys.length; i++) {
		if (i === keys.length - 1) {
			if (newProperty === undefined) {
				const msgPrefix = `/msg ${sender} `
				const random = ` ${antiSpamProtString()}`
				const msg = `${keys[i]}: ${JSON.stringify(current[keys[i]])}`
				if (msg.length < 256 - (msgPrefix.length + random.length))
					bot.chatRaw(MessageSource.Raw, msgPrefix + msg + random)
				else {
					let regex = new RegExp(`.{1,${200 - (msgPrefix.length + random.length)}}`, "g")
					const split = msg.match(regex)
					if (split) {
						for (const chunk of split) {
							bot.chatRaw(MessageSource.Raw, msgPrefix + chunk + random)
							await sleep(1000)
						}
					}
				}
			} else {
				let property = newProperty
				try {
					property = JSON.parse(newProperty)
				} catch (e) {}
				current[keys[i]] = property
				await bot.chatRaw(
					MessageSource.Raw, 
					`/msg ${sender} Changed ${keys[i]} to ${newProperty} ${antiSpamProtString()}`
				)
				await fs.writeFile("./src/config.json", JSON.stringify(config, null, 2))
			}
		} else {
			current = current[keys[i]]
		}
	}
}

async function backupConfig(bot: MinecraftBot, sender: string) {
	bot.chat(MessageSource.Raw, `/msg ${sender} Backing up config... ${antiSpamProtString()}`)
	const backup = JSON.stringify(config, null, 2)
	await fs.writeFile("./src/config-backup.json", backup)
	bot.chat(MessageSource.Raw, `/msg ${sender} Backup complete. ${antiSpamProtString()}`)
}

async function restoreConfig(bot: MinecraftBot, sender: string) {
	bot.chat(MessageSource.Raw, `/msg ${sender} Restoring config... ${antiSpamProtString()}`)
	const backup = JSON.parse(await fs.readFile("./src/config-backup.json", "utf-8"))
	await fs.writeFile("./src/config.json", JSON.stringify(backup, null, 2))
	let current = config
	current = backup
	bot.chat(MessageSource.Raw, `/msg ${sender} Restore complete. ${antiSpamProtString()}`)
}
