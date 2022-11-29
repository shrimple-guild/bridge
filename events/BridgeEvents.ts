
import { Message as DiscordMessage } from "discord.js"

export interface BridgeEvents {
  guildChat: (event: {username: string, content: string, hypixelRank?: string, guildRank?: string}) => void
  mcJoinLeave: (event: {username: string, action: "joined" | "left"}) => void
  botLeft: (reason: string) => void
  botSpam: () => void
  botJoinedLimbo: () => void
  botJoined: () => void
  botSpawned: () => void
  discordChat: (message: DiscordMessage) => void
}