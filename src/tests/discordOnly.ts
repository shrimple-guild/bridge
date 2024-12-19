import { Verification } from "../verify/Verification.js"
import { Database } from "../database/database.js"
import { HypixelAPI } from "../api/HypixelAPI.js"
import { createDiscordBot } from "../discord/discordBot.js"
import { SlashCommandManager } from "../discord/commands/SlashCommandManager.js"
import { config } from "../utils/config.js"
import { Logger } from "../utils/Logger.js"
import { migrations } from "../database/migrations.js"
import { InteractionRegistry } from "../discord/interactions/InteractionRegistry.js"

const logger = new Logger()
const database = await Database.create("./src/database", migrations)

const hypixelAPI = new HypixelAPI(config.bridge.apiKey, database, logger.category("HypixelAPI"))
const slashCommands = new SlashCommandManager()
const interactions = new InteractionRegistry()


const discordStaffRoles = config.roles.filter(role => role.isStaff).map(role => role.discord)

const discord = await createDiscordBot(
  config.discord.token,
  slashCommands,
  interactions,
  config.discord.channel,
  hypixelAPI,
  logger.category("Discord")
)

if (config.discord.verification.channelId.length > 0) { // dont wanna bother with checking if i need to check a property, its length, or just the object but this should work
  const verification = new Verification(
    discord.client,
    database,
    config.discord.verification,
    hypixelAPI,
    slashCommands,
    interactions
  );
}

