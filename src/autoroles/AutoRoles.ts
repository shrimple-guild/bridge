import { GuildMember, Role, Snowflake } from "discord.js";
import { SlashCommandManager } from "../discord/commands/SlashCommandManager";
import { ForceUpdateRolesCommand } from "./commands/ForceUpdateRolesCommand";
import { RoleInfoCommand } from "./commands/RoleInfoCommand";
import { SetAutoRoleCommand } from "./commands/SetAutoRoleCommand";
import { UpdateRolesCommand } from "./commands/UpdateRolesCommand";
import { IDatabase } from "../database/IDatabase";
import { FishingBestiaryRole } from "./roles/FishingBestiaryRole";
import { FishingXpRole } from "./roles/FishingXpRole";
import { HypixelAPI } from "../api/HypixelAPI";
import { LinkService } from "../verify/LinkService";
import { AutoRole as Requirement } from "./roles/AutoRole";

export class AutoRoles {

    static ROLES: { [key: string]: Requirement } = {
        "max_fishing_bestiary": new FishingBestiaryRole(),
        "fishing_xp_1": new FishingXpRole(1e9),
        "fishing_xp_2": new FishingXpRole(2.5e9)
    }

    static ROLE_NAMES = [
        { name: "Max Fishing Bestiary", value: "max_fishing_bestiary" },
        { name: "1B Fishing XP ", value: "fishing_xp_1" },
        { name: "2.5B Fishing XP ", value: "fishing_xp_2" }
    ]

    constructor(
        slashCommandManager: SlashCommandManager, 
        private db: IDatabase,
        private hypixelAPI: HypixelAPI,
        private linkService: LinkService
    ) {
        slashCommandManager.register(
            new ForceUpdateRolesCommand(this),
            new UpdateRolesCommand(this),
            new RoleInfoCommand(this),
            new SetAutoRoleCommand(this)
        )
    }

    static getRoleName(value: string): string {
        return this.ROLE_NAMES.find(role => value == role.value)!.name
    }

    setRole(guildId: Snowflake, roleId: Snowflake, roleType: string) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO guild_roles (guild_id, role_type, role_id)
            VALUES (?, ?, ?)
        `)
        stmt.run([guildId, roleType, roleId])
    }

    getRoles(guildId: Snowflake): DiscordAutoRole[] {
        const stmt = this.db.prepare<[string], { role_type: string, role_id: Snowflake }>(`
            SELECT role_type, role_id
            FROM guild_roles
            WHERE guild_id = ?
        `)
        const result = stmt.all(guildId);
        return result.map(role => ({
            requirement: AutoRoles.ROLES[role.role_type],
            name: AutoRoles.getRoleName(role.role_type),
            roleId: role.role_id
        }))
    }

    async updateRoles(member: GuildMember): Promise<string[]> {
        const guild = member.guild
        const autoRoles = this.getRoles(guild.id)
        const uuid = this.linkService.getMinecraftUuid(member.id)
        if (uuid == null) {
            throw new Error("Not linked to a Minecraft account! Use /link to link your account, or contact staff if you need assistance.")
        }
        const allAutoRoles = autoRoles.map(role => role.roleId)
        const memberRoles = member.roles.cache.map(role => role.id)
        const profiles = await this.hypixelAPI.fetchProfiles(uuid)
        const newAutoRoles = autoRoles.map(roles => {
            if (roles.requirement.meetsRequirement(profiles)) {
                return roles.roleId
            } else {
                return null
            }
        }).filter(role => role != null) as Snowflake[]

        const newRoles = memberRoles.filter(role => allAutoRoles.includes(role))
        newRoles.push(...newAutoRoles)
        await member.roles.set(newRoles)
        return newAutoRoles
    }
}

export type DiscordAutoRole = { 
    roleId: Snowflake, 
    name: string,
    requirement: Requirement 
}