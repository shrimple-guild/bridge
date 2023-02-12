
import { Pattern } from "./Pattern"

export const guildJoin: Pattern = {
  name: "guildJoin",
  pattern: /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) joined the guild!$/,
  execute: (bot, groups) => bot.sendToBridge(groups.name, `**joined the guild!**`, "JOINED")
}