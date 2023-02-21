import { Bazaar } from "../api/Bazaar.js";
import { HypixelAPI } from "../api/HypixelAPI.js";
import { SkyblockItems } from "../api/SkyblockItems.js";
import { SimpleCommandManager } from "../bridge/commands/SimpleCommandManager.js";
import { Logger } from "../utils/Logger.js";
import readline from "readline"

import config from "../config.json" assert { type: "json" }
import itemNames from "../data/itemNames.json" assert { type: "json" }
const { apiKey, prefix } = config.bridge


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const logger = new Logger()

const testAPI = new HypixelAPI(apiKey)

const skyblockItems = await SkyblockItems.create(testAPI, itemNames)
const bazaar = await Bazaar.create(testAPI, skyblockItems, logger.category("Bazaar"))

const commandManager = new SimpleCommandManager(prefix, "Baltics", testAPI, bazaar)


rl.on("line", async (input) => {
  console.log(await commandManager.execute(input, true))
})
