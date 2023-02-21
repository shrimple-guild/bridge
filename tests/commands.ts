import { Bazaar } from "../api/Bazaar.js";
import { HypixelAPI } from "../api/HypixelAPI.js";
import { SkyblockItems } from "../api/SkyblockItems.js";
import { SimpleCommandManager } from "../bridge/commands/SimpleCommandManager.js";
import { Logger } from "../utils/Logger.js";

import config from "../config.json" assert { type: "json" }
import itemNames from "../data/itemNames.json" assert { type: "json" }
const { apiKey, prefix } = config.bridge

const logger = new Logger()

const testAPI = new HypixelAPI(apiKey)

const skyblockItems = await SkyblockItems.create(testAPI, itemNames)
const bazaar = await Bazaar.create(testAPI, skyblockItems, logger.category("Bazaar"))

const commandManager = new SimpleCommandManager(prefix, "Baltics", testAPI, bazaar)

const response = await commandManager.execute("_bz sunder 5", false)
console.log(response)
