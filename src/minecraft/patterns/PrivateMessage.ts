import { Pattern } from "./Pattern"

export const privateMessage: Pattern = {
  name: "privateMessage",
  pattern: /^From (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): (?<content>.+$)/,
  execute: (bot, groups) => {
    if (bot.isPrivileged(groups.name)) {
      bot.chat(groups.content)
      bot.sendToBridge(bot.username, groups.content, "BOT")
    }
  }
}