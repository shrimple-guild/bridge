const weights = {
  "Cactus": 177_241.45,
  "Carrot": 300_000,
  "Cocoa Beans": 267_174.04,
  "Melon": 450_324.6,
  "Nether Wart": 250_000,
  "Potato":  300_000,
  "Pumpkin": 90_066.27,
  "Sugar Cane": 200_000,
  "Wheat": 100_000,
  "Mushroom": 90_178.06
} as const

type Crop = keyof typeof weights
type Collections = {[key in Crop]: number}

export type FarmingWeight = { 
  collections: { 
    [k in Crop]: number 
  },
  collection: number,
  level: number,
  anita: number,
  medals: number,
  minions: number,
  bonus: number,
  total: number 
} 


function collectionWeight(crops: Collections): Collections {
  const base = Object.fromEntries(Object.entries(crops).map((
    [crop, collection]) => ([crop, collection / weights[crop as Crop]]
  )))
  const total = Object.values(base).reduce((cum, cur) => cum + cur, 0)
  base["Mushroom"] -= 0.5 * base["Mushroom"] * (base["Cactus"] + base["Sugar Cane"]) / total
  return base as Collections
}

function levelWeight(profileMember: any): number {
  const farmingXp = profileMember.experience_skill_farming ?? 0
  const farmingCap = profileMember.jacob2?.perks?.farming_level_cap ?? 0
  if (farmingXp >= 111672425 && farmingCap >= 10) return 250
  return farmingXp > 55172425 ? 100 : 0
}

function contestIsGold(contest: any): boolean {
  return (contest.claimed_medal == "gold") || (contest.claimed_position <= contest.claimed_participants * 0.05 + 1)
}

function medalWeight(profileMember: any): number {
  const contests = profileMember.jacob2?.contests ?? {}
  const golds = (Object.values(contests) as any[]).reduce((golds, contest) => (
    golds + (contestIsGold(contest) ? 1 : 0)
  ), 0)
  return Math.min(Math.floor(golds / 50) * 25, 500)
}

function minionWeight(profile: any): number {
  const minions = (Object.values(profile.members) as any[]).flatMap(member => (
    member.crafted_generators ?? []
  ))
  const minionNames = ["WHEAT", "CARROT", "POTATO", "PUMPKIN", "MELON", "MUSHROOM", "COCOA", "CACTUS", "SUGAR_CANE", "NETHER_WARTS"]
  return minionNames.reduce((cum, cur) => (
    cum + (minions.includes(cur + "_12") ? 5 : 0)
  ), 0)
}

export function farmingWeight(profile: any, uuid: string): FarmingWeight | undefined {
  const profileMember = profile.members[uuid]
  const collections = profileMember.collection
  if (collections == null) return undefined
  const farmingCollections = {
    "Cactus": collections.CACTUS ?? 0,
    "Carrot": collections.CARROT_ITEM ?? 0,
    "Cocoa Beans": collections["INK_SACK:3"] ?? 0,
    "Melon": collections.MELON ?? 0,
    "Nether Wart": collections.NETHER_STALK ?? 0,
    "Potato": collections.POTATO_ITEM ?? 0,
    "Pumpkin": collections.PUMPKIN ?? 0,
    "Sugar Cane": collections.SUGAR_CANE ?? 0,
    "Mushroom": collections.MUSHROOM_COLLECTION ?? 0,
    "Wheat": collections.WHEAT ?? 0
  }
  const collectionWeights = collectionWeight(farmingCollections)
  const collection = Object.values(collectionWeights).reduce((cum, cur) => cum + cur, 0)
  const anita = (profileMember.jacob2?.perks?.double_drops ?? 0) * 2
  const medals = medalWeight(profileMember)
  const minions = minionWeight(profile)
  const level = levelWeight(profileMember)
  const bonus = anita + medals + minions + level
  return {
    collections: collectionWeights,
    collection: collection,
    level: level,
    anita: anita,
    medals: medals,
    minions: minions,
    bonus: bonus,
    total: collection + bonus
  }
}