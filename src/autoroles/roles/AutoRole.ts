import { SkyblockProfiles } from "../../api/SkyblockProfiles";

export interface AutoRole {
    meetsRequirement: (profiles: SkyblockProfiles) => boolean
}