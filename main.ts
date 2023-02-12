//import "./bridge.js"

import { Verification } from "./features/verify/Verification.js"
import { db } from "./database/database.js"
import { HypixelAPI } from "./api/HypixelAPI.js"
import { createDiscordBot } from "./discord/Discord.js"
import { SlashCommandManager } from "./applicationCommands/SlashCommandManager.js"
import config from "./config.json" assert { type: "json" }

const hypixelAPI = new HypixelAPI(config.bridge.apiKey)
const verification = new Verification(db, config.discord.verificationRoles)
const slashCommands = new SlashCommandManager(verification, hypixelAPI)

const staffRoles = config.roles.filter(role => role.isStaff).map(role => role.discord)

const discord = await createDiscordBot(config.discord.token, slashCommands, staffRoles, config.discord.channel)
