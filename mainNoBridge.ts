//import "./bridge.js"

import { Verification } from "./verify/Verification.js"
import { db } from "./database/database.js"
import { HypixelAPI } from "./api/HypixelAPI.js"
import { createDiscordBot } from "./discord/DiscordBot.js"
import { SlashCommandManager } from "./discord/commands/SlashCommandManager.js"
import config from "./config.json" assert { type: "json" }

const hypixelAPI = new HypixelAPI(config.bridge.apiKey)
const verification = new Verification(db, config.discord.verificationRoles)
const slashCommands = new SlashCommandManager(verification, hypixelAPI)

const discordStaffRoles = config.roles.filter(role => role.isStaff).map(role => role.discord)

const discord = await createDiscordBot(config.discord.token, slashCommands, discordStaffRoles, config.discord.channel)
