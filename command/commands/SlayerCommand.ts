import { Command } from "./Command.js"
import { formatNumber, titleCase } from "../../utils/Utils.js"
import { fetchProfiles } from "../../utils/apiUtils.js"
import { fetchUuid } from "../../utils/playerUtils.js"
import { resolveProfile } from "../../utils/profileUtils.js"

export class SlayerCommand implements Command {
    aliases = ["slayer"]
    usage = "<player:[profile|bingo|main]> <slayer>"

    async execute(args: string[]) {
        if (args.length < 2) return `Syntax: slayer ${this.usage}`
        const playerArg = args.shift()!.split(":")
        const playerName = playerArg[0]
        const profileArg = playerArg[1]?.toLowerCase()
        const slayer = args.shift()!
        let message
        try {
            const uuid = await fetchUuid(playerName)
            const profiles = await fetchProfiles(uuid)
            const profile = resolveProfile(profileArg, uuid, profiles)
            const cuteName = profile.cute_name
            const data = profile?.members?.[uuid]?.['slayer_bosses']?.[slayer]
            if (!data || !data.xp) {
                return `No slayer data found for ${cuteName} profile.`
            }
            message = `${titleCase(slayer)} slayer data for ${playerName} (${cuteName}): `
            message += `Total XP: ${formatNumber(data.xp, 2, true)} | Tier kills: `
            for (let i = 0; i < 5; i++) {
                const tierKills = data?.[`boss_kills_tier_${i}`]
                message += tierKills ? `${tierKills} ` : `0 `
                if (i !== 4) message += `| `
            }

        } catch (e) {
            message = "Something went wrong, API might be down!"
            console.error(e)
        }
        return message
    }
} 