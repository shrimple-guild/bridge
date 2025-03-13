import { SimpleCommand } from "./Command.js"
import { Bridge } from "../../Bridge.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { GuildRole, config } from "../../../utils/config.js"
import { SkyblockProfile } from "../../../api/SkyblockProfile.js"
import { formatNumber, sleep } from "../../../utils/utils.js"
import { HypixelGuildMember } from "../../../api/HypixelGuildMember.js"
import { general } from "../../../index.js"

export class UpdateRoleCommand extends SimpleCommand {
	aliases = ["update"]
	usage = "[username|all]"

	lastMassUpdate = -1

	constructor(
		private bridge?: Bridge,
		private hypixelAPI?: HypixelAPI
	) {
		super()
	}

	async execute(args: string[], isStaff?: boolean, username?: string) {
		if (!this.bridge) this.error("Bridge not configured, cannot use command!")
		const specifiedUsername = args.shift()
		const updatingSelf = specifiedUsername?.toLowerCase() == username?.toLowerCase()
		if (specifiedUsername) {
			if (isStaff || updatingSelf) {
				if (updatingSelf) {
					return await this.update(specifiedUsername)
				} else if (specifiedUsername.toLowerCase() == "all") {
					if (Date.now() - this.lastMassUpdate < 84600000)
						this.error("Please wait at least 24 hours between mass updates.")
					const members = await this.hypixelAPI?.fetchGuildMembers(
						config.bridge.hypixelGuild
					)
					if (!members) this.error("Failed to fetch guild members.")
					for (const member of members) {
						try {
							await this.updateMember(member)
						} catch (e) {
							general.error(`Failed to update role for member: ${member.uuid}`, e)
						}
						await sleep(2000)
					}
					this.lastMassUpdate = Date.now()
					return "Roles updated for all members!"
				} else {
					return await this.update(specifiedUsername)
				}
			} else {
				this.error("You must be staff to update the role of another member!")
			}
		} else if (username) {
			return await this.update(username)
		} else {
			this.error(
				"No username provided. This command only works in-game (for non-staff members)."
			)
		}
	}

	private async updateMember(member: HypixelGuildMember) {
		const currentRole = member.rank
		const profile = await this.getHighestProfile(member.uuid)
		if (!profile) return

		const role = await this.getRole(profile)
		if (!role) return

		const roleUpToDate = currentRole == role.name
		const nextRole = config.guildRoles[config.guildRoles.indexOf(role) - 1]

		if (!nextRole && roleUpToDate) return
		if (roleUpToDate) return
		if (!config.guildRoles.find((role) => role.name == currentRole)) return

		general.info(`Updating role for ${member.uuid} to ${role.name}.`)
		await this.bridge!.chatMinecraftRaw(`/g setrank ${member.uuid} ${role.name}`)
	}

	private async update(username: string): Promise<string> {
		const uuid = await this.hypixelAPI?.mojang.fetchUuid(username)
		if (!uuid) this.error("Invalid username provided.")

		const currentRole = (
			(await this.hypixelAPI?.fetchGuildMembers(config.bridge.hypixelGuild)) ?? []
		).find((member) => member.uuid == uuid)?.rank
		const profile = await this.getHighestProfile(uuid)
		if (!profile) this.error("Failed to fetch profile for user.")

		const role = await this.getRole(profile)
		if (!role) this.error("Failed to fetch role for user.")

		const roleUpToDate = currentRole == role.name
		const roleWithoutReq = !config.guildRoles.find((role) => role.name == currentRole)

		const nextRole = config.guildRoles[config.guildRoles.indexOf(role) - 1]
		if (!nextRole && roleUpToDate) return "You are already maxed out buddy!"

		const fishXp = nextRole
			? Math.max(0, nextRole.fishingXp - (profile.skills.fishing?.xp ?? 0))
			: 0
		const sbLvl = nextRole
			? Math.max(0, (nextRole.sbLevel - (profile.skyblockLevel ?? 0)) / 100)
			: 0

		let prefixMsg

		if (roleWithoutReq) {
			prefixMsg = "Your role does not have requirements! But you are "
			if (nextRole)
				prefixMsg += `missing ${formatNumber(fishXp, 2, true)} Fishing XP and ${sbLvl} Skyblock Levels for ${nextRole.name}.`
			else prefixMsg += "already maxed out!"
			return prefixMsg
		}

		if (roleUpToDate) {
			return `Role is already up to date! Missing ${formatNumber(fishXp, 2, true)} Fishing XP and ${sbLvl} Skyblock Levels for ${nextRole.name}.`
		}

		general.info(`Updating role for ${username} to ${role.name}.`)
		await this.bridge!.chatMinecraftRaw(`/g setrank ${username} ${role.name}`)
		return "Role updated!"
	}

	private async getHighestProfile(uuid: string) {
		const profiles = await this.hypixelAPI?.fetchProfiles(uuid)
		if (!profiles) return undefined
		return profiles.profiles.reduce((prev, cur) =>
			(cur.skyblockLevel ?? 0) > (prev.skyblockLevel ?? 0) ? cur : prev
		)
	}

	private async getRole(profile: SkyblockProfile): Promise<GuildRole | undefined> {
		return config.guildRoles.find(
			(role) =>
				(profile.skyblockLevel ?? 0) >= role.sbLevel &&
				(profile.skills.fishing?.xp ?? 0) >= role.fishingXp
		)
	}
}
