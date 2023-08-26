import { Pattern } from "./Pattern"
import config from "../../config.json" assert { type: "json" }

export const guildLevelUp: Pattern = {
  name: "guildLevelUp",
  pattern: /^The Guild has reached Level (?<level>\d+)!$/,
  execute: async (bot, groups) => {
    await bot.sendToBridge(config.minecraft.username, `:tada: **The Guild has reached Level ${groups.level}!** :tada:`, "JOINED")
  }
}