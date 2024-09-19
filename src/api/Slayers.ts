import { Level } from "./Level.js"
import fuzzy from "fuzzysort"

const slayers = [
  "zombie",
  "spider",
  "wolf",
  "enderman",
  "blaze",
  "vampire"
] as const

type SlayerName = typeof slayers[number]

const slayerMapping: { name: string, slayer: SlayerName }[] = [
  { name: "revenant horror", slayer: "zombie" },
  { name: "tarantula broodfather", slayer: "spider" },
  { name: "sven packmaster", slayer: "wolf" },
  { name: "voidgloom seraph", slayer: "enderman" },
  { name: "inferno demonlord", slayer: "blaze" },
  { name: "riftstalker bloodfiend", slayer: "vampire"},
  { name: "zombie", slayer: "zombie" },
  { name: "spider", slayer: "spider" },
  { name: "wolf", slayer: "wolf" },
  { name: "enderman", slayer: "enderman" },
  { name: "blaze", slayer: "blaze" },
  { name: "vampire", slayer: "vampire"},
  { name: "woof", slayer: "wolf"}
]

export function resolveSlayer(str: string): SlayerName | undefined {
  const result = fuzzy.go(str, slayerMapping, { key: "name", limit: 1 })[0]?.obj
  return result?.slayer
}

export function isSlayer(str: string): str is SlayerName {
  return slayers.includes(str as SlayerName)
}

export class Slayers {
  readonly zombie: Slayer
  readonly spider: Slayer
  readonly wolf: Slayer
  readonly enderman: Slayer
  readonly blaze: Slayer
  readonly vampire: Slayer

  constructor(member: any) {
    const bosses = member.slayer?.slayer_bosses
    this.zombie = new Slayer("zombie", bosses)
    this.spider = new Slayer("spider", bosses)
    this.wolf = new Slayer("wolf", bosses)
    this.enderman = new Slayer("enderman", bosses)
    this.blaze = new Slayer("blaze", bosses)
    this.vampire = new Slayer("vampire", bosses)
  }
}

export class Slayer {
  readonly level: Level
  readonly kills: number[]

  constructor(slayer: string, bosses: any) {
    const slayerData = bosses?.[slayer]
    this.level = new Level(slayer, slayerData?.xp ?? 0)
    this.kills = [0, 1, 2, 3, 4].map(i => (slayerData?.[`boss_kills_tier_${i}`] ?? 0) as number)
  }
}




