//import "./bridge.js"

import { Verification } from "./verify/Verification.js"
import { db } from "./database/database.js"
import { HypixelAPI } from "./api/HypixelAPI.js"
import { createDiscordBot } from "./discord/Discord.js"
import { SlashCommandManager } from "./applicationCommands/SlashCommandManager.js"
import config from "./config.json" assert { type: "json" }

const hypixelAPI = new HypixelAPI(config.bridge.apiKey)
const verification = new Verification(db)
const slashCommands = new SlashCommandManager(verification, hypixelAPI)

const discord = createDiscordBot(config.discord.token, slashCommands)


