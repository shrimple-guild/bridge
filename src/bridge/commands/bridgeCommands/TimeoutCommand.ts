import { LinkService } from '../../../verify/LinkService';
import { Bridge } from '../../Bridge';
import { SimpleCommand } from './Command';
import { HypixelAPI } from '../../../api/HypixelAPI';

export class TimeoutCommand extends SimpleCommand {
    aliases = ["timeout", "to"]
    usage = "<username> <duration>"

    constructor(private bridge: Bridge, private hypixelAPI: HypixelAPI, private linkService: LinkService) {
        super()
    }
    
    private durationMap: Record<string, number> = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400
    }

    async execute(args: string[], isStaff: boolean = false): Promise<string | void> {
        if (!isStaff) this.error("No permission")
        if (args.length < 2) this.throwUsageError()
        const [targetUsername, duration] = args;
        
        const durationPattern = duration.match(/(\d+)([smhd])$/)
        if (!durationPattern) this.throwUsageError()
        const [, durationNumber, durationUnit] = durationPattern
        const durationSeconds = parseInt(durationNumber) * this.durationMap[durationUnit]

        const uuid = await this.hypixelAPI.mojang.fetchUuid(targetUsername)
        const discordId = this.linkService.getDiscordId(uuid)

        await this.bridge.muteAndTimeout(durationSeconds, targetUsername, discordId)

        if (discordId) {
            return `Timed out ${targetUsername} for ${duration}`
        } else {
            return `Timed out ${targetUsername} for ${duration} (no linked Discord).`
        }
    }
}