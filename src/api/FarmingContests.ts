import { fetchWithTimeout } from "./HypixelAPI.js"
import { LoggerCategory } from "../utils/Logger.js"
import fuzzysort from "fuzzysort"

const jacobUrl = new URL("https://dawjaw.net/jacobs")
const crops = ["wheat", "carrot", "potato", "pumpkin", "sugar cane", "melon", "cactus", "cocoa beans", "mushroom", "nether wart"] as const
type Crop = typeof crops[number]

type Contest = {
  time: number,
  crops: [Crop, Crop, Crop]
}

export class FarmingContests {

  private contests: Contest[] = []

  private constructor(private logger: LoggerCategory) {}

  static async create(logger: LoggerCategory) {
    const contests = new FarmingContests(logger)
    await contests.update()
    return contests
  }

  async update() {
    try {
      if (Date.now() > (this.contests.at(-1)?.time ?? 0)) {
        const productResponse = await fetchWithTimeout(jacobUrl)
        if (!productResponse.ok) throw new Error("Failed to get Jacob event data.")
        this.contests = await productResponse.json()
        this.contests.forEach(contest => {
          contest.time *= 1000
          contest.crops = contest.crops.map(crop => crop.toLowerCase()) as [Crop, Crop, Crop]
        })
      }
    } catch (e) {
      this.logger.error("Error while updating Jacob events!", e)
    }
    setTimeout(() => this.update(), 600000)
  }

  closestCrop(crop: string) {
    const trimmed = crop.trim().toLowerCase()
    return fuzzysort.go(trimmed, crops, { limit: 1 }).at(0)?.target as Crop
  }

  nextCrop(crop: Crop) {
    return this.contests.find(contest => (contest.time > Date.now()) && (
      contest.crops.some(contestCrop => contestCrop == crop)
    ))
  }

  get next() {
    return this.contests.find(contest => contest.time > Date.now())
  }

  get current() {
    return this.contests.find(contest => (contest.time < Date.now()) && (
      (contest.time + 1200000) > Date.now()
    ))
  }
}









