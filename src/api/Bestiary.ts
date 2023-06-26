import bestiary from "../data/bestiary.json" assert { type: "json" }

export class Bestiary {
  private data: Record<string, {  name: string, tier: number, maxTier: number, kills: number }>

  constructor(member: any) {
    this.data = Object.fromEntries(bestiary.mobs.map(mob => {
      const kills = member?.bestiary?.[mob.id]
      const tiers = bestiary.leveling[mob.type as "normal" | "boss"]
      const m = tiers.length + 1
      const tier = ((tiers.findIndex(tier => tier > kills) % m) + m) % m - 1
      return [mob.id, { 
        name: mob.name,
        tier: Math.min(tier, mob.maxTier), 
        maxTier: mob.maxTier, 
        kills: kills 
      }]
    }))
  }

  get level() {
    return Object.values(this.data).reduce((prev, cur) => prev + cur.tier, 0) / 10
  }
}