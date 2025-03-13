import { SkyblockProfiles } from "../../api/SkyblockProfiles"
import { TrophyFishTier } from "../../api/TrophyFish"
import { Requirement } from "./Requirement"

export class TrophyRequirement implements Requirement {
	constructor(private tier: TrophyFishTier) {}

	meetsRequirement(profiles: SkyblockProfiles): boolean {
		return profiles.profiles.some((profile) => this.tier == profile.trophyFish.tier)
	}
}
