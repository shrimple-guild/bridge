import { SkyblockProfiles } from "../../api/SkyblockProfiles";
import { AutoRole } from "./AutoRole";

export class FishingXpRole implements AutoRole {
    constructor(private xp: number) {}

    meetsRequirement(profiles: SkyblockProfiles): boolean {
        return false
    }
}