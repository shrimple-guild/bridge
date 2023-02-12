import { Pattern } from "./Pattern"

export const guildChat: Pattern = {
  pattern: /^(Officer|Guild) > (?:\[(?<hypixelRank>[\w+]+)\] )?(?<username>\w{2,16})(?: \[(?<guildRank>[\w+]+)\])?: (?<content>.+)$/,
  execute: (bot, groups) => bot.sendToBridge(groups.username, groups.content, groups.hypixelRank, groups.guildRank)
}