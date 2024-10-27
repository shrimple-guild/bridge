import { gListData } from "../../bridge/commands/bridgeCommands/GuildStatusCommands.js"
import { Pattern } from "./Pattern"

export const gListRankRegex: Pattern = {
  name: "gListRankRegex",
  pattern: /§a-- (?<guildRank>[\w\s]+) --/,
  raw: true,
  execute: async (bot, groups) => {
    if (!gListData.listening) return
    if (!gListData.knownRanks.includes(groups.guildRank)) {
      gListData.knownRanks.push(groups.guildRank)
    }
    gListData.currentRank = groups.guildRank
  }
}

export const gListRankMembersRegex: Pattern = {
  name: "gListRankMembersRegex",
  pattern: /§[a-f0-9](?:\[(?<hypixelRank>[\w]+)(?:§[a-f0-9])?(?<rankPlus>\++)?(?:§[a-f0-9])?\]\s)?(?<name>\w{2,16})(?<status>§[ac])\s●/g,
  raw: true,
  execute: async (bot, groups, globalGroups) => {
    if (!gListData.listening) return
    for (const groups of globalGroups) {
      const hypixelRank = groups.hypixelRank + (groups.rankPlus || "")
      const username = groups.name
      const online = groups.status === "§a"
      gListData.addMember(hypixelRank, username, online)
    }
  }
}

export const gListOnlineMembersRegex: Pattern = {
  name: "gListOnlineMembersRegex",
  pattern: /§eOnline Members: §a(?<onlineMembers>[\d]+)/,
  raw: true,
  execute: async (bot, groups) => {
    if (!gListData.listening) return
    gListData.onlineMembers = +groups.onlineMembers
    gListData.listening = false
  }
}

export const gListTotalMembersRegex: Pattern = {
  name: "gListTotalMembersRegex",
  pattern: /§eTotal Members: §a(?<totalMembers>[\d]+)/,
  raw: true,
  execute: async (bot, groups) => {
    if (!gListData.listening) return
    gListData.totalMembers = +groups.totalMembers
  }
}