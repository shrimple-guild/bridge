import { Bazaar } from "../api/Bazaar.js";
import { HypixelAPI } from "../api/HypixelAPI.js";
import { SkyblockItems } from "../api/SkyblockItems.js";
import { SimpleCommandManager } from "../bridge/commands/SimpleCommandManager.js";
import { Logger } from "../utils/Logger.js";
import readline from "readline"

import config from "../config.json" assert { type: "json" }
import itemNames from "../data/itemNames.json" assert { type: "json" }
import { Database } from "../database/database.js";
import { migrations } from "../database/migrations.js";
const { apiKey, prefix } = config.bridge


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const logger = new Logger()
const database = await Database.create("./database", migrations)

const testAPI = new HypixelAPI(apiKey, database, logger.category("HypixelAPI"))
await testAPI.init(itemNames)

const commandManager = new SimpleCommandManager(prefix, "Baltics", testAPI)

const results = await Promise.all([
  commandManager.execute("_bz grand", false), 
  commandManager.execute("_bz p jasper", false)
])

console.log(results)

rl.on("line", async (input) => {
  console.log(await commandManager.execute(input, true))
})
