import { antiSpamProtString } from "../../utils/utils.js"
import { Pattern } from "./Pattern"

export const booReceived: Pattern = {
  name: "booReceived",
  pattern: /^From (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): Boo!$/,
  execute: async (bot, groups) => {
    const content = `AAH! You scared me, ${groups.name}!`
    bot.chat(`${content} ${antiSpamProtString()}`)
    bot.sendToBridge(bot.username, content)
  }
}