import { SlashCommandManager } from "./applicationCommands/SlashCommandManager.js"

import config from "./config.json" assert { type: "json" }

const slashCommands = new SlashCommandManager()
await slashCommands.loadCommands(config.discord.token, config.discord.client, config.discord.guild)
