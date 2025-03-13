import { SkyblockProfiles } from "../../api/SkyblockProfiles"

export interface Requirement {
	meetsRequirement: (profiles: SkyblockProfiles) => boolean
}
