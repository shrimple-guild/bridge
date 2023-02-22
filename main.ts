//import "./bridge.js"

import { Verification } from "./verify/Verification.js"
import { HypixelAPI } from "./api/HypixelAPI.js"
import { createDiscordBot } from "./discord/DiscordBot.js"
import { SlashCommandManager } from "./discord/commands/SlashCommandManager.js"
import config from "./config.json" assert { type: "json" }
import itemNames from "./data/itemNames.json" assert { type: "json" }
import { MinecraftBot } from "./minecraft/MinecraftBot.js"
import { Bridge } from "./bridge/Bridge.js"
import { SimpleCommandManager } from "./bridge/commands/SimpleCommandManager.js"
import { Logger } from "./utils/Logger.js"
import readline from "readline"
import exitHook from "async-exit-hook"
import { sleep } from "./utils/Utils.js"
import { SkyblockItems } from "./api/SkyblockItems.js"
import { Bazaar } from "./api/Bazaar.js"
import { Database } from "./database/database.js"
import { migrations } from "./database/migrations.js"

const logger = new Logger()
const database = await Database.create("./database", migrations)

const hypixelAPI = new HypixelAPI(config.bridge.apiKey, database, logger.category("HypixelAPI"))
const slashCommands = new SlashCommandManager()

const discordStaffRoles = config.roles.filter(role => role.isStaff).map(role => role.discord)
const minecraftStaffRoles = config.roles.filter(role => role.isStaff).map(role => role.hypixelTag)

const discord = await createDiscordBot(
  config.discord.token, 
  slashCommands, 
  discordStaffRoles,
  config.discord.channel, 
  hypixelAPI,
  logger.category("Discord")
)

const verification = new Verification(
  discord.client, 
  database, 
  config.discord.verification, 
  hypixelAPI, 
  slashCommands
)

const bridgeCommandManager = new SimpleCommandManager(config.bridge.prefix, config.minecraft.username, hypixelAPI, logger.category("Commands"))

const minecraft = new MinecraftBot(config.minecraft.username, config.minecraft.privilegedUsers, minecraftStaffRoles, logger.category("Minecraft"))
const bridge = new Bridge(discord, minecraft, bridgeCommandManager, logger.category("Bridge"))

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on("line", (input) => {
  if (input != "quit") {
    bridge.chatAsBot(input)
  } else {
    bridge.quit()
  }
})

exitHook(async (cb) => {
  bridge.chatAsBot("Process ended.")
  await sleep(1000)
  bridge.quit()
  await sleep(1000)
  cb()
})