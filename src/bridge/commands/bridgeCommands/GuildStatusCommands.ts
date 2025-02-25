import { Bridge } from "../../Bridge.js"
import { SimpleCommand } from "./Command.js"

export type GuildMember = {
  hypixelRank: string
  username: string
  guildRank: string
  online: boolean
}

class GListData {
  listening = false

  totalMembers = 0
  onlineMembers = 0

  knownRanks: string[] = []
  currentRank = ""

  members: GuildMember[] = []

  addMember(hypixelRank: string, username: string, status: boolean, guildRank?: string) {
    this.members.push({ hypixelRank, username, guildRank: guildRank ?? this.currentRank, online: status })
  }

  changeStatus(username: string, status: boolean) {
    const member = this.members.find(m => m.username === username)
    if (member) member.online = status
  }

  changeRank(username: string, rank: string) {
    const member = this.members.find(m => m.username === username)
    if (member) member.guildRank = rank
  }

  clear() {
    this.members = []
    this.knownRanks = []
    this.currentRank = ""
    this.totalMembers = 0
    this.onlineMembers = 0
  }

  async done() {
    const startTime = Date.now()
    while (this.listening) {
      if (Date.now() - startTime > 3000) {
        this.listening = false
        throw new Error("Refreshing glist data timed out.")
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  async resetData(bridge: Bridge) {
    gListData.clear()
    gListData.listening = true
    bridge.chatMinecraftRaw("/g list")
    await gListData.done()
  }
}

export const gListData = new GListData();

export class GListCommand extends SimpleCommand {
  aliases = ["glist"]
  discordOnly = true

  constructor(private bridge?: Bridge) {
    super()
  }

  async execute(args: string[]) {
    if (!this.bridge) this.error("Bridge not configured, cannot use command!");

    await gListData.resetData(this.bridge);

    let embedMessage = "";

    const rankToMembersMap = gListData.members.reduce((acc, member) => {
      if (!acc[member.guildRank]) acc[member.guildRank] = []
      acc[member.guildRank].push(member)
      return acc
    }, {} as Record<string, GuildMember[]>)

    for (const rank in rankToMembersMap) {
      const members = rankToMembersMap[rank]
      const online = members.filter(m => m.online).length
      const total = members.length
      const memberList = members.map(m => `${m.online ? "__" : ""}${escapeFormatting(m.username)}${m.online ? "__" : ""}`).join("\u1CBC")
      embedMessage += `**${rank}** (${online}/${total} online)\n${memberList}\n\n`
    }

    embedMessage += `Total Members: ${gListData.totalMembers}\nOnline Members: ${gListData.onlineMembers}`
    this.bridge!.discord.sendSimpleEmbed("Guild List", embedMessage)
    return "Sent guild list to bridge channel."
  }
} 

export class GOnlineCommand extends SimpleCommand {
  aliases = ["gonline"]
  discordOnly = true

  constructor(private bridge?: Bridge) {
    super()
  }

  async execute(args: string[]) {
    if (!this.bridge) this.error("Bridge not configured, cannot use command!");

    await gListData.resetData(this.bridge);

    let embedMessage = "";

    const onlineMembers = gListData.members.filter(m => m.online)

    const rankToMembersMap = onlineMembers.reduce((acc, member) => {
      if (!acc[member.guildRank]) acc[member.guildRank] = []
      acc[member.guildRank].push(member)
      return acc
    }, {} as Record<string, GuildMember[]>)

    for (const rank in rankToMembersMap) {
      const members = rankToMembersMap[rank]
      const memberList = members.map(m => `${escapeFormatting(m.username)}`).join("\u1CBC")
      embedMessage += `**${rank}** (${members.length} online)\n${memberList}\n\n`
    }

    embedMessage += `Total Online Members: ${onlineMembers.length}`

    this.bridge!.discord.sendSimpleEmbed("Guild Online", embedMessage)
    return "Sent online guild members to bridge channel."
  }
}

function escapeFormatting(text: string) {
  return text.replace(/_/g, "\\_").replace(/\*/g, "\\*").replace(/~/g, "\\~")
}