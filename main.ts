//import "./bridge.js"

import { Verification } from "./features/verify/Verification.js"
import { db } from "./database/database.js"
import { HypixelAPI } from "./api/HypixelAPI.js"
import { createDiscordBot } from "./discord/DiscordBot.js"
import { SlashCommandManager } from "./applicationCommands/SlashCommandManager.js"
import config from "./config.json" assert { type: "json" }
import { MinecraftBot } from "./features/bridge/minecraft/MinecraftBot.js"
import { Bridge } from "./features/bridge/Bridge.js"
import { BridgeCommandManager } from "./features/bridge/commands/BridgeCommandManager.js"

const hypixelAPI = new HypixelAPI(config.bridge.apiKey)
const verification = new Verification(db, config.discord.verificationRoles)
const slashCommands = new SlashCommandManager(verification, hypixelAPI)

const commandManager = new BridgeCommandManager(config.bridge.prefix, config.minecraft.username, hypixelAPI)

const discordStaffRoles = config.roles.filter(role => role.isStaff).map(role => role.discord)
const minecraftStaffRoles = config.roles.filter(role => role.isStaff).map(role => role.hypixelTag)

const discord = await createDiscordBot(config.discord.token, slashCommands, discordStaffRoles, config.discord.channel)

const minecraft = new MinecraftBot(config.minecraft.username, config.minecraft.privilegedUsers, minecraftStaffRoles)
const bridge = new Bridge(discord, minecraft, commandManager)
