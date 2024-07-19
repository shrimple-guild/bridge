import { HypixelAPI } from "../../../api/HypixelAPI"
import { SimpleCommand } from "./Command"

export class BestiaryCommand implements SimpleCommand {
    aliases = ["bestiary", "be"]
    usage = "<player:[profile|bingo|main]> <type|mob>"

    constructor(private hypixelAPI: HypixelAPI) { }

    async execute(args: string[]) {
        if (args.length < 2) return `Syntax: bestiary ${this.usage}`
        const playerArg = args.shift()!.split(":")
        const playerName = playerArg[0]
        const profileArg = playerArg[1]?.toLowerCase()
        const mainArg = args.join(" ")?.toLowerCase()!

        const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
        if (!uuid) return `Player not found`
        const profiles = await this.hypixelAPI.fetchProfiles(uuid)
        const profile = profiles.getByQuery(profileArg)
        if (!profile) return `Profile not found`
        const byIsland = profile.bestiary.getByIsland(mainArg)
        if (byIsland) {
            let retStr = `${byIsland.name} bestiary for ${playerName} (${profile.cuteName}) k/d (kdr): `
            byIsland.mobs.forEach(mob => {
                retStr += `${mob.name} ${mob.kills}/${mob.deaths} `
                if (mob.kdr) retStr += `(${mob.kdr.toFixed(2)}) `
            })
            return retStr
        } else {
            const byMob = profile.bestiary.getByMob(mainArg)
            if (byMob) {
                let str = `${byMob.name} data for ${playerName} (${profile.cuteName}) k/d (kdr): ${byMob.kills}/${byMob.deaths} `
                if (byMob.kdr) str += `(${byMob.kdr.toFixed(2)})`
                return str
            } else {
                return `Invalid type or mob: ${mainArg}`
            }
        }
    }
}

