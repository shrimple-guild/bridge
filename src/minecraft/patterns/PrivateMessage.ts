import { Pattern } from "./Pattern"

export const privateMessage: Pattern = {
  name: "privateMessage",
  pattern: /^From (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): (?<content>.+$)/,
  execute: async (bot, groups) => {
    if (bot.isPrivileged(groups.name)) {
      await bot.chat(groups.content)
      await bot.sendToBridge(bot.username, groups.content, "BOT")
    }
  }
}