import { Pattern } from "./Pattern"

export const guildLeave: Pattern = {
  pattern: /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) left the guild!$/,
  execute: (bot, groups) => bot.sendToBridge(groups.name, `**left the guild!**`, "LEFT")
}