import { HypixelAPI } from "../../../api/HypixelAPI"
import { SimpleCommand } from "./Command.js"

export class BestiaryCommand extends SimpleCommand {
    aliases = ["be", "bestiary"]
    usage = "<player:[profile|bingo|main]> <type|mob>"

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
                this.error(`Invalid type or mob: ${mainArg}`)
            }
        }
    }
}

