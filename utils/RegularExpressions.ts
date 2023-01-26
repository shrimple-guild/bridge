export const guildChatPattern = /^Guild > (?:\[(?<hypixelRank>[\w+]+)\] )?(?<username>\w{2,16})(?: \[(?<guildRank>[\w+]+)\])?: (?<content>.+)$/
export const mcJoinLeavePattern = /^Guild > (?<username>\w{2,16}) (?<action>joined|left).$/
export const limboRegex = /^You were spawned in Limbo.$/
export const numberFormatRegex = /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g
export const imageLinkRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|tiff|svg)/g
export const partyInviteRegex = /(?:You have been invited to join )?(?<username>\w{2,16})(?:'s party!| has invited you to join their party!)/
export const spamRegex = /^You cannot say the same message twice!$/
export const dungeonEnteredRegex = /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) entered (?<dungeon>.+)$/m
export const privateMessageRegex = /^From (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): (?<content>.+$)/
export const guildLeaveRegex = /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) left the guild!$/
export const guildJoinRegex = /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) joined the guild!$/
export const guildKickRegex = /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) was kicked from the guild by \[(?<rank2>[\w+]+)\] (?<name2>\w{2,16})!$/