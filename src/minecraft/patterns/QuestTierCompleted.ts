import { Pattern } from "./Pattern"
import config from "../../config.json" assert { type: "json" }

export const questTierCompleted: Pattern = {
  name: "questTierCompleted",
  pattern: /^GUILD QUEST TIER (?<tier>\d+) COMPLETED!$/,
  execute: (bot, groups) => {
    bot.sendToBridge(config.minecraft.username, `:tada: **GUILD QUEST TIER ${groups.tier} COMPLETED!** :tada:`, "JOINED")
  }
}