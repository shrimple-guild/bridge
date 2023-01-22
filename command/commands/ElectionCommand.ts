import fetch from "node-fetch"
import humanize from "humanize-duration"
import { titleCase } from "../../utils/utils.js"
import jaroDistance from "jaro-winkler"

export class ElectionCommand implements Command {
  aliases = ["election", "mayor"]

  skyblockEpoch = 1560275700000
  electionOver = 105600000
  year = 1000 * 50 * 24 * 31 * 12

  nextRecurringEvent(epoch: number, offset: number, interval: number) {
    return interval - (Date.now() - (epoch + offset)) % interval
  }

  async execute(args: string[]) {
    const response = await fetch("https://api.hypixel.net/resources/skyblock/election")
    if (response.status != 200) return "API fetch error! Try again later."
    const electionData = await response.json() as any
    if (!electionData.success) return "Hypixel API error! Try again later."
    let nextElection = this.nextRecurringEvent(this.skyblockEpoch, this.electionOver, this.year)
    let currentMayor = electionData.mayor.name
    let nextMayor = electionData.current != null
      ? electionData.current.candidates.sort((a: { votes: number }, b: { votes: number }) => b.votes - a.votes)[0].name
      : null
    let nextSpecials = [
      { name: "scorpius", time: this.nextRecurringEvent(this.skyblockEpoch, this.electionOver, this.year * 24) },
      { name: "derpy", time: this.nextRecurringEvent(this.skyblockEpoch, this.electionOver + this.year * 8, this.year * 24) },
      { name: "jerry", time: this.nextRecurringEvent(this.skyblockEpoch, this.electionOver + this.year * 16, this.year * 24) }
    ]
    let nextSpecial = nextSpecials.sort((a, b) => a.time - b.time)[0]
    if (!args || args.length == 0) {
      let res = `Current mayor: ${currentMayor}. Next mayor: `
      if (nextMayor != null) {
        res += `${nextMayor}, `
      }
      res += `in ${humanize(nextElection, { largest: 2, delimiter: " and " })}. `

      return `${res}Next special: ${titleCase(nextSpecial.name)}, in ${humanize(nextSpecial.time, { largest: 2, delimiter: " and " })}.`
    } else {
      let mayorQuery = args.join(" ").toLowerCase()
      let nextSpecial = nextSpecials.sort((a, b) => jaroDistance(mayorQuery, b.name) - jaroDistance(mayorQuery, a.name))[0]
      return `${titleCase(nextSpecial.name)} is in ${humanize(nextSpecial.time, { largest: 2, delimiter: " and " })}.`
    }
  }
}