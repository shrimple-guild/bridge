import { antiSpamProtString } from "../../utils/utils.js"
import { Pattern } from "./Pattern"

export const privateMessageFailed: Pattern = {
  name: "privateMessageFailed",
  pattern: /^You cannot message this player./,
  execute: async (bot, groups) => {
    const content = `Could not send a private message to that player. ${antiSpamProtString()}`
    bot.chat(content)
    bot.sendToBridge(bot.username, content)
  }
}

export const privateMessageFailedOffline: Pattern = {
    name: "privateMessageFailedOffline",
    pattern: /^That player is not online!/,
    execute: async (bot, groups) => {
      const content = `Can't message an offline player. ${antiSpamProtString()}`
      bot.chat(content)
      bot.sendToBridge(bot.username, content)
    }
  }