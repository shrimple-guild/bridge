import { SimpleCommand } from "./Command.js"
import { Bridge } from "../../Bridge.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"

export class UpdateRoleCommand implements SimpleCommand {
    aliases = ["update"]
    usage?: "[username]"

    constructor(private bridge?: Bridge, private hypixelAPI?: HypixelAPI) {}

    async execute(args: string[], isStaff?: boolean, username?: string) {
      if (!this.bridge) return "Bridge not configured; cannot use command!"
      if (!this.bridge.roles) return "Roles are not configured for this guild."
      const specifiedUsername = args.shift()
      const specifiedNameIsUsername = specifiedUsername?.toLocaleLowerCase() == username?.toLocaleLowerCase()      
      if (specifiedUsername) {
        if (isStaff || specifiedNameIsUsername) {
          const role = await this.getRole(specifiedUsername)
          this.bridge.chatMinecraftRaw(`/setrank ${username} ${role}`)
        } else {
          return "You must be staff to update the role of another member!"
        }
      } else if (username) {
        const role = await this.getRole(username)
        this.bridge.chatMinecraftRaw(`/setrank ${username} ${role}`)
      } else {
        return "No username provided. This command only works in-game (for non-staff members)."
      }
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
        return this.bridge?.roles?.find(role => (
          level >= role.sbLevel && fishingXp >= role.fishingXp
        )) 
      })
      return profileRoles.reduce((prev, cur) => (
        ((cur?.priority ?? 0) > (prev?.priority ?? 0)) ? cur : prev
      ), undefined)?.name
    }
}