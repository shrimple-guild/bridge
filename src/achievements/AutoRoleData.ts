import { CollectionRequirement } from "./roles/CollectionRequirement.js";
import { FishingBestiaryRequirement } from "./roles/FishingBestiaryRequirement.js";
import { FishingXpRequirement } from "./roles/FishingXpRequirement.js";
import { Requirement } from "./roles/Requirement.js";
import { TrophyRequirement } from "./roles/TrophyRequirement.js";

export const AchievementsData = {
    // keys are discord customId; must redeploy commands if these are changed
    achievements: {
        "max_fishing_bestiary": new FishingBestiaryRequirement(),
        "fishing_xp_1": new FishingXpRequirement(1e9),
        "fishing_xp_2": new FishingXpRequirement(2.5e9),
        "ink_collection": new CollectionRequirement("ink sac", 5e6),
        "dia_trophy_hunter": new TrophyRequirement("diamond")
    } as { [key: string]: Requirement },

    // values are discord customId; must redeploy commands if these are changed
    achievementNames: [
        { name: "Max Fishing Bestiary", value: "max_fishing_bestiary" },
        { name: "1B Fishing XP ", value: "fishing_xp_1" },
        { name: "2.5B Fishing XP ", value: "fishing_xp_2" },
        { name: "5M Ink Collection ", value: "ink_collection" },
        { name: "Diamond Trophy Hunter", value: "dia_trophy_hunter" }
    ]
}