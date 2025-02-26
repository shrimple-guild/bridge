import { HypixelAPI } from "../api/HypixelAPI";
import { Database } from "../database/database.js"

import { config } from "../utils/config.js"
import { migrations } from "../database/migrations.js"

import { Logger } from "../utils/Logger.js"

const logger = new Logger()
const database = await Database.create(":memory:", migrations)

const hypixelAPI = new HypixelAPI(config.bridge.apiKey, database, logger.category("HypixelAPI"))
await hypixelAPI.init()

const auctionManager = hypixelAPI.auction

if (auctionManager) {
    const startTime = performance.now();

    const auctionItems = await auctionManager.getAuctionItems();
    
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    console.log(`Time taken to get auction items: ${timeTaken}ms`);
}


