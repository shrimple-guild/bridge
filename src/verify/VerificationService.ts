import { GuildMember } from "discord.js"
import { IDatabase } from "../database/IDatabase.js"

export class VerificationService {
	private db: IDatabase

	constructor(db: IDatabase) {
		this.db = db
	}

	verifyMember(guildId: string, discordId: string): boolean {
		const stmt = this.db.prepare(
			`INSERT OR IGNORE INTO verified_members (guild_id, discord_id) VALUES (?, ?)`
		)
		const result = stmt.run(guildId, discordId)
		return result.changes > 0
	}

	unverifyMember(guildId: string, discordId: string): boolean {
		const stmt = this.db.prepare(
			`DELETE FROM verified_members WHERE guild_id = ? AND discord_id = ?`
		)
		const result = stmt.run(guildId, discordId)
		return result.changes > 0
	}

	isVerified(guildId: string, discordId: string): boolean {
		const stmt = this.db.prepare(
			`SELECT 1 FROM verified_members WHERE guild_id = ? AND discord_id = ?`
		)
		const result = stmt.get(guildId, discordId)
		return result != null
	}

	isMemberVerified(guildMember: GuildMember): boolean {
		return this.isVerified(guildMember.guild.id, guildMember.user.id)
	}

	getVerificationRoles(guildId: string): VerificationRoles | null {
		const stmt = this.db.prepare<[string], VerificationRoles>(
			`SELECT verified_role, unverified_role FROM guild_settings WHERE guild_id = ?`
		)
		const result = stmt.get(guildId)
		return result ?? null
	}

	setVerificationRoles(guildId: string, unverified: string, verified: string) {
		const stmt = this.db.prepare<[string, string, string], null>(`
      INSERT INTO guild_settings (guild_id, unverified_role, verified_role)
      VALUES (?, ?, ?)
      ON CONFLICT (guild_id)
      DO UPDATE SET
      verified_role = excluded.verified_role,
      unverified_role = excluded.unverified_role;`)
		stmt.run(guildId, unverified, verified)
	}

	async sync(guildMember: GuildMember) {
		const verificationRoles = this.getVerificationRoles(guildMember.guild.id)
		if (verificationRoles == null) return
		if (guildMember.user.bot) {
			await guildMember.roles.set(this.nonVerificationRoles(guildMember, verificationRoles))
		} else if (this.isMemberVerified(guildMember)) {
			await this.setVerifiedRole(guildMember)
		} else {
			await this.setUnverifiedRole(guildMember)
		}
	}

	async setVerifiedRole(guildMember: GuildMember, reason?: string) {
		const verificationRoles = this.getVerificationRoles(guildMember.guild.id)
		if (verificationRoles == null) return
		const otherRoles = this.nonVerificationRoles(guildMember, verificationRoles)
		await guildMember.roles.set([verificationRoles.verified_role, ...otherRoles], reason)
	}

	async setUnverifiedRole(guildMember: GuildMember, reason?: string) {
		const verificationRoles = this.getVerificationRoles(guildMember.guild.id)
		if (verificationRoles == null) return
		const otherRoles = this.nonVerificationRoles(guildMember, verificationRoles)
		await guildMember.roles.set([verificationRoles.unverified_role, ...otherRoles], reason)
	}

	private nonVerificationRoles(guildMember: GuildMember, verificationRoles: VerificationRoles) {
		const roles = guildMember.roles.cache.map((role) => role.id)
		return roles.filter(
			(role) =>
				![verificationRoles.verified_role, verificationRoles.unverified_role].includes(role)
		)
	}
}

type VerificationRoles = { verified_role: string; unverified_role: string }
