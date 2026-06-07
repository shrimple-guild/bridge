import { SimpleCommand } from "./Command.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"

export class SeenCommand extends SimpleCommand {
    aliases = ["seen"]
    usage = "<player>"

    constructor(private hypixelAPI: HypixelAPI) {
        super()
    }

    async execute(args: string[]) {
        if (args.length < 1) this.throwUsageError()
        const playerName = args.shift()!

        const uuid = await this.hypixelAPI.mojang.fetchUuid(playerName)
        if (!uuid) this.error(`Could not find a player with the name ${playerName}.`)

        const status = await this.hypixelAPI.fetchStatus(uuid)

        if (status?.online) {
            const gameType = status.gameType || "unknown game"
            const mode = status.mode || "unknown mode"
            const map = status.map || ""

            if (gameType !== "SKYBLOCK") {
                return `${playerName} is currently online in ${gameType}.`
            } else {
                return `${playerName} is currently online in SkyBlock (${mode}${map ? ", " + map : ""})`
            }
        }

        const player = await this.hypixelAPI.fetchPlayer(uuid)

        const lastLogout = player.lastLogout

        if (!lastLogout) {
            this.error(`${playerName} has never logged out (may be online now, or API is disabled).`)
        }
        const now = Date.now()
        const then = new Date(lastLogout).getTime()

        if (Number.isNaN(then)) {
            return `Failed to get ${playerName.endsWith("s") ? "'" : "'s"} logout time`
        }

        const diff = Math.max(0, now - then)

        const minute = 1000 * 60
        const hour = minute * 60
        const day = hour * 24
        const year = day * 365

        const years = Math.floor(diff / year)
        const days = Math.floor((diff % year) / day)
        const hours = Math.floor((diff % day) / hour)
        const minutes = Math.floor((diff % hour) / minute)

        const parts = []
        if (years) parts.push(`${years} year${years !== 1 ? "s" : ""}`)
        if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`)
        if (hours) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`)
        if (minutes) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`)

        const formattedDiff = parts.length ? parts.join(", ") : "just now"

        const pad = (n: any) => String(n).padStart(2, "0")
        const date = new Date(then)

        const formattedDate =
            `${pad(date.getUTCDate())}-${pad(date.getUTCMonth() + 1)}-${date.getUTCFullYear()} ` +
            `${pad(date.getUTCHours())}-${pad(date.getUTCMinutes())}-${pad(date.getUTCSeconds())} UTC`

        return `${playerName} was last logged out ${formattedDiff} ago on ${formattedDate}`
    }
}