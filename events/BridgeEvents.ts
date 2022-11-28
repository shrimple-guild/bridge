
import { Message as DiscordMessage } from "discord.js"
export type BridgeEvents = {
  guildChat: (username: string, content: string, hypixelRank?: string, guildRank?: string) => void
  mcJoined: (username: string) => void
  mcLeft: (username: string) => void
  enteredLimbo: () => void
  spamProtection: () => void
  partyInvite: (username: string) => void
  discordChat: (message: DiscordMessage) => void
  botLeft: (reason: string) => void
  botJoined: () => void
  spawn: () => void
}