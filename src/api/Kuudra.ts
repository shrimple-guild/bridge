import { isInteger } from "../utils/utils.js"

const kuudraTiers = ["basic", "hot", "burning", "fiery", "infernal"] as const
type KuudraTier = typeof kuudraTiers[number]

export function isKuudraTier(tier: string): tier is KuudraTier {
  return kuudraTiers.includes(tier as KuudraTier)
}

export class Kuudra {
  private tiers: number[]
  readonly highestWaveInfernal?: number
  
  constructor(member: any) {
    this.tiers = [
      member?.nether_island_player_data?.kuudra_completed_tiers?.none ?? 0,
      member?.nether_island_player_data?.kuudra_completed_tiers?.hot ?? 0,
      member?.nether_island_player_data?.kuudra_completed_tiers?.burning ?? 0,
      member?.nether_island_player_data?.kuudra_completed_tiers?.fiery ?? 0,
      member?.nether_island_player_data?.kuudra_completed_tiers?.infernal ?? 0,
    ]
    this.highestWaveInfernal = member?.nether_island_player_data?.kuudra_completed_tiers?.highest_wave_infernal
  }

  getTier(tier: KuudraTier | number) {
    if (isInteger(tier)) {
      return this.tiers[tier + 1]
    } else {
      return this.tiers[kuudraTiers.findIndex(res => res == tier)]
    }
  }

  get collection() {
    return this.tiers.reduce((acc, comp, idx) => acc + comp * (idx + 1), 0)
  }

  get comps() {
    return this.tiers.reduce((acc, comp) => acc + comp, 0)
  }
}