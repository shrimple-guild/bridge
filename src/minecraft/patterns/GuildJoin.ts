
import { gListData } from "../../bridge/commands/bridgeCommands/GuildStatusCommands.js"
import { Pattern } from "./Pattern"

export const guildJoin: Pattern = {
  name: "guildJoin",
  pattern: /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) joined the guild!$/,
  execute: async (bot, groups) => {
    gListData.totalMembers++
    const lowestRank = gListData.members[gListData.members.length - 1].guildRank
    gListData.addMember(groups.rank, groups.name, true, lowestRank)
    await bot.sendToBridge(groups.name, `**joined the guild!**`, "JOINED")
  }
}