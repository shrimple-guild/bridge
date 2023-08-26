import { LoggerCategory } from "../utils/Logger";
import { MinecraftBot } from "./MinecraftBot";
import { guildChat } from "./patterns/GuildChat.js";
import { guildJoin } from "./patterns/GuildJoin.js";
import { guildKick } from "./patterns/GuildKick.js";
import { guildLeave } from "./patterns/GuildLeave.js";
import { guildLevelUp } from "./patterns/GuildLevelUp.js";
import { guildPromoteDemote } from "./patterns/GuildPromoteDemote.js";
import { limbo } from "./patterns/Limbo.js";
import { minecraftJoinLeave } from "./patterns/MinecraftJoinLeave.js";
import { privateMessage } from "./patterns/PrivateMessage.js";
import { questTierCompleted } from "./patterns/QuestTierCompleted.js";
import { spamProtection } from "./patterns/SpamProtection.js";

export const PatternManager = {
  patterns: [
    guildChat,
    guildJoin,
    guildKick,
    guildLeave,
    limbo,
    minecraftJoinLeave,
    privateMessage,
    spamProtection,
    guildPromoteDemote,
    guildLevelUp,
    questTierCompleted
  ],

  execute: async (bot: MinecraftBot, message: string, logger?: LoggerCategory) => {
    for (const pattern of PatternManager.patterns) {
      const patternArray = Array.isArray(pattern.pattern) ? pattern.pattern : [pattern.pattern]
      const matchingPattern = patternArray.find(pattern => pattern.test(message))
      if (matchingPattern != null) {
        logger?.info(`Matched ${pattern.name}: ${message}`)
        const groups = message.match(matchingPattern)?.groups!
        await pattern.execute(bot, groups)
        return 
      }
    }
    logger?.debug(`Unmatched: ${message}`)
  }
}