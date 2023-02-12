import { SlashCommandManager } from "./discord/commands/SlashCommandManager.js"

import config from "./ambientConfig.json" assert { type: "json" }

const slashCommands = new SlashCommandManager()
await slashCommands.loadCommands(config.discord.token, config.discord.client, config.discord.guild)
