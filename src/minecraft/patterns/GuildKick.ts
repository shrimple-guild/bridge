import { gListData } from "../../bridge/commands/bridgeCommands/GuildStatusCommands.js"
import { Pattern } from "./Pattern"

export const guildKick: Pattern = {
  name: "guildKick",
  pattern: /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) was kicked from the guild by \[(?<rank2>[\w+]+)\] (?<name2>\w{2,16})!$/,
  execute: async (bot, groups) => {
    gListData.totalMembers--
    gListData.members = gListData.members.filter(member => member.username !== groups.name)
    await bot.sendToBridge(groups.name, `**was kicked from the the guild by ${groups.name2}!**`, "LEFT")
  }
}