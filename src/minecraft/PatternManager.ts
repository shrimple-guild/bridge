import { LoggerCategory } from "../utils/Logger";
import { MinecraftBot } from "./MinecraftBot";
import { boopReceived } from "./patterns/BoopReceived.js";
import { boopSent } from "./patterns/BoopSent.js";
import { booReceived } from "./patterns/BooReceived.js";
import { booSent } from "./patterns/BooSent.js";
import { gListOnlineMembersRegex, gListRankMembersRegex, gListRankRegex, gListTotalMembersRegex } from "./patterns/GListCommandRegex.js";
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
import { privateMessageFailed, privateMessageFailedOffline, privateMessageFailedBlocked } from "./patterns/PrivateMessageFailed.js";
import { questTierCompleted } from "./patterns/QuestTierCompleted.js";
import { spamProtection } from "./patterns/SpamProtection.js";

export const PatternManager = {
	patterns: [
		booReceived,
		booSent,
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
		privateMessageFailedBlocked,
		questTierCompleted,
		spamProtection,
		gListRankRegex,
		gListRankMembersRegex,
		gListTotalMembersRegex,
		gListOnlineMembersRegex
	],

	execute: async (
		bot: MinecraftBot,
		formattedMessage: string,
		plainMessage: string,
		logger?: LoggerCategory
	) => {
		plainMessage = plainMessage.trim();
		formattedMessage = formattedMessage.trim();

		for (const pattern of PatternManager.patterns) {
			const message = pattern.raw ? formattedMessage : plainMessage;
			const patterns = Array.isArray(pattern.pattern) ? pattern.pattern : [pattern.pattern];

			const matchingPattern = patterns.find((pattern) =>
				pattern.test(message)
			);

			if (matchingPattern) {
				logger?.info(`Matched ${pattern.name}: ${plainMessage}`);
				const groups = [];
				matchingPattern.lastIndex = 0;
				if (matchingPattern.global) {
					let match;
					while ((match = matchingPattern.exec(message)) !== null) {
						groups.push(match.groups!);
					}
				} else {
					const match = message.match(matchingPattern);
					if (match) {
						groups.push(match.groups!);
					}
				}
				await pattern.execute(bot, groups[0], groups);
				return;
			}
		}
		logger?.debug(`Unmatched: ${plainMessage}`);
	}
};
