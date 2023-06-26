import { HypixelAPI } from "../../../api/HypixelAPI.js"
import { msToTime } from "../../../utils/utils.js"
import { SimpleCommand } from "./Command.js"


export class ContestCommand implements SimpleCommand {
  aliases = ["contest", "crop", "farming"]
  usage = "[crop]"

  constructor(private hypixelAPI: HypixelAPI) {}

  async execute(args: string[]) {
    const contests = this.hypixelAPI.contests
    if (contests == null) return `Bazaar isn't instantiated! Please report this!`
    const crop = (args.length != 0) ? args.join(" ") : undefined
    const currentContest = contests.current
    let message = currentContest ? `Active contest (${currentContest.crops.join(", ")}) ending in ${msToTime((currentContest.time + 1200000) - Date.now())}! ` : ""
    if (crop) {
      const bestCrop = contests.closestCrop(crop)
      if (!bestCrop) {
        message = `"${crop}" is not a known crop!`
      } else {
        const nextContest = contests.nextCrop(bestCrop)
        message += nextContest ? `Next ${bestCrop} contest in ${msToTime(nextContest.time - Date.now())}.` : `No ${bestCrop} contest found.`
      }
    } else {
      const nextContest = contests.next
      message += nextContest ? `Next contest (${nextContest.crops.join(", ")}) in ${msToTime(nextContest.time - Date.now())}.` : `No contest found.`
    }
    return message
  }
} 

