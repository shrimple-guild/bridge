import { Pattern } from "./Pattern"

export const guildPromoteDemote: Pattern = {
  name: "guildPromoteDemote",
  pattern: /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) was (?<action>promoted|demoted) from (?<initial>[\w ]+) to (?<final>[\w ]+)$/,
  execute: (bot, groups) => {
    const promoted = groups.action == "promoted" 
    const actionString = promoted ? "promoted" : "demoted"
    bot.sendToBridge(groups.name, `${actionString} to ${groups.final}!`, promoted ? "JOINED" : "LEFT")
  }
}
