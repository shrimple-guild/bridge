import { GuildMember, Snowflake } from "discord.js";
import { SlashCommandManager } from "../discord/commands/SlashCommandManager";
import { SetAutoRoleCommand } from "./commands/AchievementSettingsCommand";
import { AchievementsCommand } from "./commands/AchievementsCommand";
import { IDatabase } from "../database/IDatabase";
import { HypixelAPI } from "../api/HypixelAPI";
import { LinkService } from "../verify/LinkService";
import { Requirement } from "./roles/Requirement";
import { AchievementsData } from "./AutoRoleData";


export class Achievements {

    constructor(
        slashCommandManager: SlashCommandManager, 
        private db: IDatabase,
        private hypixelAPI: HypixelAPI,
        private linkService: LinkService
    ) {
        slashCommandManager.register(
            new AchievementsCommand(this),
            new SetAutoRoleCommand(this)
        )
    }

    static getAchievementName(value: string): string {
        return AchievementsData.achievementNames.find(role => value == role.value)!.name
    }

    addOrUpdateAchievement(guildId: Snowflake, roleId: Snowflake, roleType: string) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO achievement_roles (guild_id, requirement, role_id)
            VALUES (?, ?, ?)
        `)
        stmt.run([guildId, roleType, roleId])
    }

    deleteAchievement(guildId: Snowflake, roleType: string) {
        const stmt = this.db.prepare(`
            DELETE FROM achievement_roles WHERE guild_id = ? AND requirement = ?
        `)
        stmt.run([guildId, roleType])
    }

    getAchievements(guildId: Snowflake): AchievementRole[] {
        const stmt = this.db.prepare<[string], { requirement: string, role_id: Snowflake }>(`
            SELECT requirement, role_id
            FROM achievement_roles
            WHERE guild_id = ?
        `)
        const result = stmt.all(guildId);
        return result.map(role => ({
            requirement: AchievementsData.achievements[role.requirement],
            name: Achievements.getAchievementName(role.requirement),
            roleId: role.role_id
        }))
    }

    async updateRoles(member: GuildMember): Promise<string[]> {
        const guild = member.guild
        const autoRoles = this.getAchievements(guild.id)
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

        const newRoles = memberRoles.filter(role => !allAutoRoles.includes(role))
        newRoles.push(...newAutoRoles)
        await member.roles.set(newRoles)
        return newAutoRoles
    }
}

export type AchievementRole = { 
    roleId: Snowflake, 
    name: string,
    requirement: Requirement 
}