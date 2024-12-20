import { SimpleCommand } from "./Command.js"
import { HumanizeDurationLanguage, HumanizeDuration } from "humanize-duration-ts"
import { titleCase } from "../../../utils/utils.js"
import { jaroWinkler as jaroDistance} from "jaro-winkler-typescript"
import { HypixelAPI } from "../../../api/HypixelAPI.js"

export class ElectionCommand extends SimpleCommand {
  aliases = ["election", "mayor"]

  usage = "[mayor]"

  skyblockEpoch = 1560275700000
  electionOver = 105600000
  year = 1000 * 50 * 24 * 31 * 12

  langService = new HumanizeDurationLanguage();
  humanizer = new HumanizeDuration(this.langService);

  constructor(private hypixelAPI: HypixelAPI) {
    super()
  }

  nextRecurringEvent(epoch: number, offset: number, interval: number) {
    return interval - (Date.now() - (epoch + offset)) % interval
  }

  async execute(args: string[]) {
    const electionData = await this.hypixelAPI.fetchElections()
    if (!electionData.success) this.error("Hypixel API error! Try again later.")
    const nextElection = this.nextRecurringEvent(this.skyblockEpoch, this.electionOver, this.year)
    const currentMayor = electionData.mayor.name
    const candidates = electionData.current?.candidates || []
    const sortedCandidates = candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0))
    let nextMayor;
    if (sortedCandidates && sortedCandidates.some((candidate) => candidate.votes)) {
      nextMayor = sortedCandidates[0].name
    }
    let nextSpecials = [
      { name: "scorpius", time: this.nextRecurringEvent(this.skyblockEpoch, this.electionOver, this.year * 24) },
      { name: "derpy", time: this.nextRecurringEvent(this.skyblockEpoch, this.electionOver + this.year * 8, this.year * 24) },
      { name: "jerry", time: this.nextRecurringEvent(this.skyblockEpoch, this.electionOver + this.year * 16, this.year * 24) }
    ]
    let nextSpecial = nextSpecials.sort((a, b) => a.time - b.time)[0]
    if (!args.length) {
      let res = `Current mayor: ${currentMayor}. Next mayor: ${nextMayor || "Unknown"}, `
      res += `in ${this.humanizer.humanize(nextElection, { largest: 2, delimiter: " and " })}. `

      return `${res}Next special: ${titleCase(nextSpecial.name)}, in ${this.humanizer.humanize(nextSpecial.time, { largest: 2, delimiter: " and " })}.`
    } else {
      let mayorQuery = args.join(" ").toLowerCase()
      let nextSpecial = nextSpecials.sort((a, b) => jaroDistance(mayorQuery, b.name) - jaroDistance(mayorQuery, a.name))[0]
      return `${titleCase(nextSpecial.name)} is in ${this.humanizer.humanize(nextSpecial.time, { largest: 3, delimiter: " and " })}.`
    }
  }
}