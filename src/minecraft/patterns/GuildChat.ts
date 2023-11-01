import { Pattern } from "./Pattern"

export const guildChat: Pattern = {
  name: "guildChat",
  pattern: /^Guild > (?:\[(?<hypixelRank>[\w+]+)\] )?(?<username>\w{2,16})(?: \[(?<guildRank>[\w+]+)\])?: (?<content>.+)$/,
  execute: async (bot, groups) => {
    if (groups.username === bot.username) {
      if (!groups.content.startsWith("Pong!")) return
    }
    await bot.sendToBridge(groups.username, groups.content, groups.hypixelRank, groups.guildRank)
  }
}