import { GuildMember, Role, Snowflake } from "discord.js";
import { SlashCommandManager } from "../discord/commands/SlashCommandManager";
import { ForceUpdateRolesCommand } from "./commands/ForceUpdateRolesCommand";
import { RoleInfoCommand } from "./commands/RoleInfoCommand";
import { SetAutoRoleCommand } from "./commands/SetAutoRoleCommand";
import { UpdateRolesCommand } from "./commands/UpdateRolesCommand";
import { IDatabase } from "../database/IDatabase";
import { FishingBestiaryRole } from "./roles/FishingBestiaryRole";
import { FishingXpRole } from "./roles/FishingXPRole";
import { HypixelAPI } from "../api/HypixelAPI";
import { LinkService } from "../verify/LinkService";
import { AutoRole } from "./roles/AutoRole";

export class AutoRoles {

    static ROLES: { [key: string]: AutoRole } = {
        "max_fishing_bestiary": new FishingBestiaryRole(),
        "fishing_xp_1": new FishingXpRole(1e9),
        "fishing_xp_2": new FishingXpRole(2.5e9)
    }

    constructor(
        slashCommandManager: SlashCommandManager, 
        private db: IDatabase,
        private hypixelAPI: HypixelAPI,
        private linkService: LinkService
    ) {
        slashCommandManager.register(
            new ForceUpdateRolesCommand(),
            new UpdateRolesCommand(),
            new RoleInfoCommand(),
            new SetAutoRoleCommand()
        )
    }

    setRole(guildId: Snowflake, roleId: Snowflake, roleType: string) {
        const stmt = this.db.prepare(`
            INSERT INTO guild_roles (guild_id, role_type, role_id)
            VALUES (?, ?, ?)
            ON CONFLICT(guild_id, role_type) DO UPDATE SET role_id = excluded.role_id
        `)
        stmt.run([guildId, roleType, roleId]);
    }

    getRoles(guildId: Snowflake): DiscordAutoRole[] {
        const stmt = this.db.prepare<[string], { role_type: string, role_id: Snowflake }>(`
            SELECT role_type, role_id
            FROM guild_roles
            WHERE guild_id = ?
        `);
        const result = stmt.all(guildId);
        return result.map(role => ({
            role: AutoRoles.ROLES[role.role_type],
            roleId: role.role_id
        }))
    }

    async updateRoles(member: GuildMember) {
        const guild = member.guild
        const autoRoles = this.getRoles(guild.id)
        const uuid = this.linkService.getMinecraftUuid(member.id)
        if (uuid == null) {
            throw new Error("Not linked to a Minecraft account! Use /link to link your account, or contact staff if you need assistance.")
        }
        const allAutoRoles = autoRoles.map(role => role.roleId)
        const memberRoles = member.roles.cache.map(role => role.id)


    }

    // when a update roles command is executed, it should figure out which roles are enabled for that guild.
    // then, for each enabled role, it should check whether that role is met by the user and report that result back.
    // finally, the autoroles should consolidate all roles to add/remove and execute it in a single operation.

}

export type DiscordAutoRole = { 
    roleId: Snowflake, 
    role: AutoRole 
}