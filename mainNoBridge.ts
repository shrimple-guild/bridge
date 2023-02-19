import { Verification } from "./verify/Verification.js"
import { db } from "./database/database.js"
import { HypixelAPI } from "./api/HypixelAPI.js"
import { createDiscordBot } from "./discord/DiscordBot.js"
import { SlashCommandManager } from "./discord/commands/SlashCommandManager.js"
import config from "./config.json" assert { type: "json" }
import { Logger } from "./utils/Logger.js"

const logger = new Logger()

const hypixelAPI = new HypixelAPI(config.bridge.apiKey)
const slashCommands = new SlashCommandManager()

const discordStaffRoles = config.roles.filter(role => role.isStaff).map(role => role.discord)

const discord = await createDiscordBot(
  config.discord.token, 
  slashCommands, 
  discordStaffRoles,
  config.discord.channel, 
  logger.category("Discord")
)

const verification = new Verification(
  discord.client, 
  db, 
  config.discord.verification, 
  hypixelAPI, 
  slashCommands
)

