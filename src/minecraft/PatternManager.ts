import { LoggerCategory } from "../utils/Logger";
import { MinecraftBot } from "./MinecraftBot";
import { boopReceived } from "./patterns/BoopReceived.js";
import { boopSent } from "./patterns/BoopSent.js";
import { guildChat } from "./patterns/GuildChat.js";
import { guildJoin } from "./patterns/GuildJoin.js";
import { guildKick } from "./patterns/GuildKick.js";
import { guildLeave } from "./patterns/GuildLeave.js";
import { guildLevelUp } from "./patterns/GuildLevelUp.js";
import { guildPromoteDemote } from "./patterns/GuildPromoteDemote.js";
import { guildRankGift } from "./patterns/GuildRankGift.js";
import { limbo } from "./patterns/Limbo.js";
import { minecraftJoinLeave } from "./patterns/MinecraftJoinLeave.js";
import { privateMessage } from "./patterns/PrivateMessage.js";
import { privateMessageFailed, privateMessageFailedOffline } from "./patterns/PrivateMessageFailed.js";
import { questTierCompleted } from "./patterns/QuestTierCompleted.js";
import { spamProtection } from "./patterns/SpamProtection.js";

export const PatternManager = {
	patterns: [
		boopReceived,
		boopSent,
		guildChat,
		guildJoin,
		guildKick,
		guildLeave,
		guildLevelUp,
		guildPromoteDemote,
		guildRankGift,
		limbo,
		minecraftJoinLeave,
		privateMessage,
		privateMessageFailed,
		privateMessageFailedOffline,
		questTierCompleted,
		spamProtection
	],

	execute: async (
		bot: MinecraftBot,
		message: string,
		logger?: LoggerCategory
	) => {
		message = message.trim();
		for (const pattern of PatternManager.patterns) {
			const patternArray = Array.isArray(pattern.pattern)
				? pattern.pattern
				: [pattern.pattern];
			const matchingPattern = patternArray.find((pattern) =>
				pattern.test(message)
			);
			if (matchingPattern != null) {
				logger?.info(`Matched ${pattern.name}: ${message}`);
				const groups = message.match(matchingPattern)?.groups!;
				await pattern.execute(bot, groups);
				return;
			}
		}
		logger?.debug(`Unmatched: ${message}`);
	}
};
