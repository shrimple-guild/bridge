import { HypixelAPI } from "../../../api/HypixelAPI"
import { SimpleCommand } from "./Command.js"

export class CollectionCommand extends SimpleCommand {
    aliases = ["collection", "coll", "col"]
    usage = "<player:[profile|bingo|main]> <collection|item>"

    constructor(private hypixelAPI: HypixelAPI) {
        super()
    }

    async execute(args: string[]) {
        if (args.length < 2) this.throwUsageError()
        const playerArg = args.shift()!.split(":")
        const playerName = playerArg[0]
        const profileArg = playerArg[1]?.toLowerCase()
        const mainArg = args.join(" ")?.toLowerCase()!

        const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
        if (!uuid) this.error(`Player not found`)
        const profiles = await this.hypixelAPI.fetchProfiles(uuid)
        const profile = profiles.getByQuery(profileArg)
        if (!profile) this.error(`Profile not found`)
        if (!profile.collections.all.length) this.error(`No collection data found for ${playerName} (${profile.cuteName})`)
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
                this.error(`Invalid collection category or item: ${mainArg}`)
            }
        }
        
    }
}

