import { gListData } from "../../bridge/commands/bridgeCommands/GuildStatusCommands.js"
import { Pattern } from "./Pattern"

export const guildLeave: Pattern = {
  name: "guildLeave",
  pattern: /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) left the guild!$/,
  execute: async (bot, groups) => {
    gListData.totalMembers--
    gListData.members = gListData.members.filter(member => member.username !== groups.name)
    await bot.sendToBridge(groups.name, `**left the guild!**`, "LEFT")
  }
}