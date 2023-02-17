import { HypixelAPI } from "../api/HypixelAPI.js";
import { CataCommand } from "../bridge/commands/bridgeCommands/CataCommand.js";
import { SkillsCommand } from "../bridge/commands/bridgeCommands/SkillsCommand.js";
import { SlayerCommand } from "../bridge/commands/bridgeCommands/SlayerCommand.js";
import { TrophyFishCommand } from "../bridge/commands/bridgeCommands/TrophyFishCommand.js";

import config from "../config.json" assert { type: "json" }
const { apiKey } = config.bridge

const testAPI = new HypixelAPI(apiKey)
const skillsCommand = new SkillsCommand(testAPI)
const slayerCommand = new SlayerCommand(testAPI)
const cataCommand = new CataCommand(testAPI)
const trophyFishCommand = new TrophyFishCommand(testAPI)

console.log(await skillsCommand.execute(["appable:blueberry", "foraging"]))
console.log(await slayerCommand.execute(["appable:orange", "blaze"]))
console.log(await cataCommand.execute(["appable", "m7"]))
console.log(await trophyFishCommand.execute(["appable", "obfuscated", "1"]))
