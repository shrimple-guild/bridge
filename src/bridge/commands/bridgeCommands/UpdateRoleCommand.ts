import { SimpleCommand } from "./Command.js"
import { Bridge } from "../../Bridge.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"

export class UpdateRoleCommand implements SimpleCommand {
    aliases = ["update"]
    usage?: "[username]"

    constructor(private bridge?: Bridge, private hypixelAPI?: HypixelAPI) {}

    async execute(args: string[], isStaff?: boolean, username?: string) {
      if (!this.bridge) return "Bridge not configured, cannot use command!"
      console.log(`${args} | ${isStaff} | ${username}`)
      const specifiedUsername = args.shift()
      const updatingSelf = specifiedUsername?.toLowerCase() == username?.toLowerCase()      
      if (specifiedUsername) {
        if (isStaff || updatingSelf) {
          const role = await this.getRole(specifiedUsername)
          console.log(`Updating role for ${specifiedUsername} to ${role}.`)
          this.bridge.chatMinecraftRaw(`/g setrank ${specifiedUsername} ${role}`)
          return "Role updated!"
        } else {
          return "You must be staff to update the role of another member!"
        }
      } else if (username) {
        const role = await this.getRole(username)
        console.log(`Updating role for ${username} to ${role}.`)
        this.bridge.chatMinecraftRaw(`/g setrank ${username} ${role}`)
      } else {
        return "No username provided. This command only works in-game (for non-staff members)."
      }
      return "A username must be provided."
    }

    private async getRole(username: string): Promise<string | undefined> {
      const uuid = await this.hypixelAPI?.mojang.fetchUuid(username)
      if (!uuid) return undefined
      const profiles = await this.hypixelAPI?.fetchProfiles(uuid)
      if (!profiles) return undefined
      const roles = this.bridge?.roles
      if (!roles) return undefined
      const profileRoles = profiles.profiles.map(profile => {
        const level = profile.skyblockLevel ?? 0
        const fishingXp = profile.skills.fishing?.xp ?? 0
        return roles.find(role => (
          level >= role.sbLevel && fishingXp >= role.fishingXp
        )) 
      })
      return profileRoles.reduce((prev, cur) => (
        ((cur?.priority ?? -Infinity) > (prev?.priority ?? -Infinity)) ? cur : prev
      ), undefined)?.name
    }
}