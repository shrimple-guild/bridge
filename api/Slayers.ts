import { Level } from "./Level.js"

const slayers = [
  "zombie",
  "spider",
  "wolf",
  "enderman",
  "blaze"
] as const

type SlayerName = typeof slayers[number]

export function isSlayer(str: string): str is SlayerName {
  return slayers.includes(str as SlayerName)
}

export class Slayers {
  readonly zombie: Slayer
  readonly spider: Slayer
  readonly wolf: Slayer
  readonly enderman: Slayer
  readonly blaze: Slayer

  constructor(member: any) {
    const bosses = member.slayer_bosses
    this.zombie = new Slayer("zombie", bosses)
    this.spider = new Slayer("spider", bosses)
    this.wolf = new Slayer("wolf", bosses)
    this.enderman = new Slayer("enderman", bosses)
    this.blaze = new Slayer("blaze", bosses)
  }
}

export class Slayer {
  readonly level: Level
  readonly kills: number[]

  constructor(slayer: string, bosses: any) {
    const slayerData = bosses[slayer]
    this.level = new Level(slayer, slayerData?.xp ?? 0)
    this.kills = [0, 1, 2, 3, 4].map(i => (slayerData?.[`boss_kills_tier_${i}`] ?? 0) as number)
  }
}




