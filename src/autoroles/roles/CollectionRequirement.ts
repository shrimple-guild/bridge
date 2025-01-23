import { SkyblockProfiles } from "../../api/SkyblockProfiles";
import { Requirement } from "./Requirement";

export class CollectionRequirement implements Requirement {
    constructor(private collection: string, private required: number) {}

    meetsRequirement(profiles: SkyblockProfiles): boolean {
        return profiles.profiles.some(profile => (profile.collections.getByItem(this.collection)?.amount ?? 0) >= this.required)
    }
}