import { skillData } from "../utils/skillUtils.js"
import { formatNumber } from "../utils/Utils.js"

export class Level {
  readonly xp: number
  readonly level: number

  private levelXps: number[]
  private maxLevelUser: number | undefined

  constructor(skill: string, xp: number, maxLevel?: number) {
    const levelXps = skillData[skill]
    if (!levelXps) throw new Error("Not a known skill!")
    this.levelXps = levelXps
    const m = this.levelXps.length + 1
    this.level = ((this.levelXps.findIndex(levelXp => levelXp > xp) % m) + m) % m - 1
    this.xp = xp
    this.maxLevelUser = maxLevel
  }

  get xpToNext() {
    return this.xpToLevel(this.level + 1)
  }

  get maxLevel() {
    return this.maxLevelUser ?? (this.levelXps.length - 1)
  }

  get overflow() {
    return this.xp - this.levelXps[this.level]
  }

  get fractionalLevel() {
    const xpForNext = this.levelXps[this.level + 1] ?? Infinity
    return this.level + this.overflow / (xpForNext - this.levelXps[this.level])
  }

  xpToLevel(level: number) {
    const nextLevel = level
    const xpForNext = this.levelXps[nextLevel] ?? Infinity
    return xpForNext - this.xp
  }

  toString() {
    return `Level ${this.level} (xp: ${formatNumber(this.xp, 2, true)})`
  }
}


export function buildSkyblockSkillLike(skill: string, xp: number | undefined) {
  if (xp != null) return new Level(skill, xp)
}


