import { HypixelAPI } from "../../../api/HypixelAPI"
import { SimpleCommand } from "./Command"

export class CollectionCommand implements SimpleCommand {
    aliases = ["collection", "coll", "col"]
    usage = "<player:[profile|bingo|main]> <collection|item>"

    constructor(private hypixelAPI: HypixelAPI) { }

    async execute(args: string[]) {
        if (args.length < 2) return `Syntax: collection ${this.usage}`
        const playerArg = args.shift()!.split(":")
        const playerName = playerArg[0]
        const profileArg = playerArg[1]?.toLowerCase()
        const mainArg = args.join(" ")?.toLowerCase()!

        const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
        if (!uuid) return `Player not found`
        const profiles = await this.hypixelAPI.fetchProfiles(uuid)
        const profile = profiles.getByQuery(profileArg)
        if (!profile) return `Profile not found`
        if (!profile.collections.all.length) return `No collection data found for ${playerName} (${profile.cuteName})`
        const byCategory = profile.collections.getByCategory(mainArg)
        if (byCategory.length) {
            let retStr = `${mainArg} completion for ${playerName} (${profile.cuteName}): `
            byCategory.forEach(collection => {
                retStr += `${collection.name} ${collection.unlockedTier}/${collection.maxTier} (${collection.amtString}) `
            })
            return retStr
        } else {
            const byItem = profile.collections.getByItem(mainArg)
            if (byItem) {
                return `${byItem.name} data for ${playerName} (${profile.cuteName}): ${byItem.unlockedTier}/${byItem.maxTier} (${byItem.amtString})`
            } else {
                return `Invalid collection category or item: ${mainArg}`
            }
        }
        
    }
}

