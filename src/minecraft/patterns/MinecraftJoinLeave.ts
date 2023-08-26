import { Pattern } from "./Pattern"

export const minecraftJoinLeave: Pattern = {
  name: "minecraftJoinLeave",
  pattern: /^Guild > (?<username>\w{2,16}) (?<action>joined|left).$/,
  execute: async (bot, groups) => {
    const joined = groups.action == "joined" 
    await bot.sendToBridge(groups.username, joined ? "**joined.**" : "**left.**", joined ? "JOINED" : "LEFT")
  }
}