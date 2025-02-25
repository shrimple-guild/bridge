import { Pattern } from "./Pattern"

export const guildLeave: Pattern = {
  name: "guildLeave",
  pattern: /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) left the guild!$/,
  execute: async (bot, groups) => {
    await bot.sendToBridge(groups.name, `**left the guild!**`, "LEFT")
  }
}