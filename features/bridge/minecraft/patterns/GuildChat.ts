import { Pattern } from "./Pattern"

export const guildChat: Pattern = {
  pattern: /^Guild > (?:\[(?<hypixelRank>[\w+]+)\] )?(?<username>\w{2,16})(?: \[(?<guildRank>[\w+]+)\])?: (?<content>.+)$/,
  execute: (bot, groups) => {
    if (groups.username === bot.username) return
    bot.sendToBridge(groups.username, groups.content, groups.hypixelRank, groups.guildRank)
  }
}