import { Pattern } from "./Pattern"
import config from "../../config.json" assert { type: "json" }

export const guildPromoteDemote: Pattern = {
  name: "guildPromoteDemote",
  pattern: /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) was (?<action>promoted|demoted) from (?<initial>[\w ]+) to (?<final>[\w ]+)$/,
  execute: (bot, groups) => {
    const promoted = groups.action == "promoted"
    bot.sendToBridge(config.minecraft.username, `**${groups.name} was ${groups.action} to ${groups.final}!**`, promoted ? "JOINED" : "LEFT")
  }
}