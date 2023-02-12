import { MinecraftBot } from "./MinecraftBot";
import { enteredDungeon } from "./patterns/EnteredDungeon.js";
import { guildChat } from "./patterns/GuildChat.js";
import { guildJoin } from "./patterns/GuildJoin.js";
import { guildKick } from "./patterns/GuildKick.js";
import { guildLeave } from "./patterns/GuildLeave.js";
import { limbo } from "./patterns/Limbo.js";
import { minecraftJoinLeave } from "./patterns/MinecraftJoinLeave.js";
import { partyInvite } from "./patterns/PartyInvite.js";
import { privateMessage } from "./patterns/PrivateMessage.js";
import { spamProtection } from "./patterns/SpamProtection.js";

export const PatternManager = {
  patterns: [
    enteredDungeon,
    guildChat,
    guildJoin,
    guildKick,
    guildLeave,
    limbo,
    minecraftJoinLeave,
    partyInvite,
    privateMessage,
    spamProtection
  ],

  execute: (bot: MinecraftBot, message: string) => {
    for (const pattern of PatternManager.patterns) {
      const patternArray = Array.isArray(pattern.pattern) ? pattern.pattern : [pattern.pattern]
      const matchingPattern = patternArray.find(pattern => pattern.test(message))
      if (matchingPattern != null) {
        const groups = message.match(matchingPattern)?.groups!
        pattern.execute(bot, groups)
        return
      }
    }
  }
}