import { SkyblockProfiles } from "../../api/SkyblockProfiles"
import { Requirement } from "./Requirement"

export class FishingXpRequirement implements Requirement {
	constructor(private requiredXp: number) {}

	meetsRequirement(profiles: SkyblockProfiles): boolean {
		return profiles.profiles.some(
			(profile) => (profile.skills?.fishing?.xp ?? 0) >= this.requiredXp
		)
	}
}
