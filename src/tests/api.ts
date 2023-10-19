import { HypixelAPI } from "../api/HypixelAPI.js";
import { Logger } from "../utils/Logger.js";

import { config } from "../utils/config.js"
import itemNames from "../data/itemNames.json" assert { type: "json" };
import { Database } from "../database/database.js";
import { migrations } from "../database/migrations.js";
import {
	getGuildRank,
	getGuildRequirementResults
} from "../discord/GuildReqs.js";
const { apiKey, prefix } = config.bridge;

const logger = new Logger();
const database = await Database.create("./src/database", migrations);

const testAPI = new HypixelAPI(apiKey, database, logger.category("HypixelAPI"));
await testAPI.init(itemNames);

const uuid = await testAPI.mojang.fetchUuid("lordjawbus");
const profiles = await testAPI.fetchProfiles(uuid);

const guildReqs = await getGuildRequirementResults(profiles.main);

const rank = getGuildRank(guildReqs);

console.log(guildReqs);
console.log(rank);
