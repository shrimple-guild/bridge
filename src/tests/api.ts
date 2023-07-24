import { HypixelAPI } from "../api/HypixelAPI.js";
import { Logger } from "../utils/Logger.js";

import config from "../config.json" assert { type: "json" }
import itemNames from "../data/itemNames.json" assert { type: "json" }
import { Database } from "../database/Pool.js";
import { migrations } from "../database/migrations.js";
const { apiKey, prefix } = config.bridge


const logger = new Logger()
const database = await Database.create("./src/database", migrations)

const testAPI = new HypixelAPI(apiKey, database, logger.category("HypixelAPI"))
await testAPI.init(itemNames)


const uuid = await testAPI.mojang.fetchUserData("YouAreRexist")
const profiles = await testAPI.fetchProfiles(uuid)

console.log(profiles.main.bestiary.level)