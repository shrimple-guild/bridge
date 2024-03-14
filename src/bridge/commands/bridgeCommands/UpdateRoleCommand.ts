import { SimpleCommand } from "./Command.js"
import { Bridge } from "../../Bridge.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { GuildRole, config } from "../../../utils/config.js"
import { SkyblockProfile } from "../../../api/SkyblockProfile.js"
import { formatNumber } from "../../../utils/utils.js"

export class UpdateRoleCommand implements SimpleCommand {
    aliases = ["update"]
    usage?: "[username]"

    constructor(private bridge?: Bridge, private hypixelAPI?: HypixelAPI) {}

    async execute(args: string[], isStaff?: boolean, username?: string) {
      if (!this.bridge) return "Bridge not configured, cannot use command!"
      const specifiedUsername = args.shift()
      const updatingSelf = specifiedUsername?.toLowerCase() == username?.toLowerCase()      
      if (specifiedUsername) {
        if (isStaff || updatingSelf) {
          return await this.update(specifiedUsername)
        } else {
          return "You must be staff to update the role of another member!"
        }
      } else if (username) {
        return await this.update(username)
      } else {
        return "No username provided. This command only works in-game (for non-staff members)."
      }
    }

    private async update(username: string): Promise<string> {
      const uuid = await this.hypixelAPI?.mojang.fetchUuid(username)
        if (!uuid) return "Invalid username provided."
        const currentRole = (await this.hypixelAPI?.fetchGuildMembers(config.bridge.hypixelGuild) ?? []).find(member => member.uuid == uuid)?.rank
        const profile = await this.getHighestProfile(uuid)
        if (!profile) return "Failed to fetch profile for user."
        const role = await this.getRole(profile)
        if (!role) return "Failed to fetch role for user."
        const nextRole = config.guildRoles[config.guildRoles.indexOf(role) - 1]
        if (!nextRole) return "You are already maxed out buddy!"
        const fishXp = Math.max(0, nextRole.fishingXp - (profile.skills.fishing?.xp ?? 0))
        const sbLvl = Math.max(0, (nextRole.sbLevel - (profile.skyblockLevel ?? 0)) / 100)
        let prefixMsg;
        if (!config.guildRoles.find(role => role.name == currentRole)) prefixMsg = "Your role does not have requirements! But you are"
        if (currentRole == role.name) prefixMsg = "Role is already up to date!"
        if (prefixMsg) return prefixMsg + ` Missing ${formatNumber(fishXp, 2, true)} Fishing XP and ${sbLvl} Skyblock Levels for ${nextRole.name}.`
        console.log(`Updating role for ${username} to ${role.name}.`)
        await this.bridge!.chatMinecraftRaw(`/g setrank ${username} ${role.name}`)
        return "Role updated!"
    }

    private async getHighestProfile(uuid: string) {
      const profiles = await this.hypixelAPI?.fetchProfiles(uuid)
      if (!profiles) return undefined
      return profiles.profiles.reduce((prev, cur) => (
        (cur.skyblockLevel ?? 0) > (prev.skyblockLevel ?? 0) ? cur : prev
      ))
    }

    private async getRole(profile: SkyblockProfile): Promise<GuildRole | undefined> {
      return config.guildRoles.find(role => (
        (profile.skyblockLevel ?? 0) >= role.sbLevel && (profile.skills.fishing?.xp ?? 0) >= role.fishingXp
      ))
    }
}