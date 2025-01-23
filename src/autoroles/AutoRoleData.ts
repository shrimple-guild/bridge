import { CollectionRequirement } from "./roles/CollectionRequirement";
import { FishingBestiaryRequirement } from "./roles/FishingBestiaryRequirement";
import { FishingXpRequirement } from "./roles/FishingXpRequirement";
import { Requirement } from "./roles/Requirement";
import { TrophyRequirement } from "./roles/TrophyRequirement";

export const AutoRoleData = {
    roles: {
        "max_fishing_bestiary": new FishingBestiaryRequirement(),
        "fishing_xp_1": new FishingXpRequirement(1e9),
        "fishing_xp_2": new FishingXpRequirement(2.5e9),
        "ink_collection": new CollectionRequirement("ink sac", 5e6),
        "dia_trophy_hunter": new TrophyRequirement("diamond")
    } as { [key: string]: Requirement },

    roleNames: [
        { name: "Max Fishing Bestiary", value: "max_fishing_bestiary" },
        { name: "1B Fishing XP ", value: "fishing_xp_1" },
        { name: "2.5B Fishing XP ", value: "fishing_xp_2" }
    ]
}