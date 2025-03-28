import { HypixelAPI } from "../api/HypixelAPI.js"
import { SimpleCommandManager } from "../bridge/commands/SimpleCommandManager.js"
import { Logger } from "../utils/Logger.js"
import readline from "readline"

import { config } from "../utils/config.js"
import itemNames from "../data/itemNames.json" assert { type: "json" }
import { Database } from "../database/database.js"
import { migrations } from "../database/migrations.js"
const { apiKey } = config.bridge

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
} as any)

const database = await Database.create("./src/database", migrations)

const testAPI = new HypixelAPI(apiKey, database, Logger.category("HypixelAPI"))
await testAPI.init(itemNames)

const commandManager = new SimpleCommandManager(testAPI)

const results = await Promise.all([
	commandManager.execute("_bz grand", false, false),
	commandManager.execute("_bz p jasper", false, false)
])

console.log(results)

rl.on("line", async (input) => {
	console.log(await commandManager.execute(input, false, true))
})
