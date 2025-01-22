import { SkyblockProfiles } from "../../api/SkyblockProfiles";
import { AutoRole } from "./AutoRole";

export class FishingBestiaryRole implements AutoRole {
    meetsRequirement(profiles: SkyblockProfiles): boolean {
        return false
    }
}