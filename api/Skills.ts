import { buildSkyblockSkillLike, Level } from "./Level.js"

const skills = [
  "taming",
  "farming",
  "mining",
  "combat",
  "foraging",
  "fishing",
  "enchanting",
  "alchemy",
  "runecrafting"
] as const

type Skill = typeof skills[number]

export function isSkill(str: string): str is Skill {
  return skills.includes(str as Skill)
}

export class Skills {
  readonly taming?: Level
  readonly farming?: Level
  readonly mining?: Level
  readonly combat?: Level
  readonly foraging?: Level
  readonly fishing?: Level
  readonly enchanting?: Level
  readonly alchemy?: Level
  readonly carpentry?: Level
  readonly runecrafting?: Level

  constructor(member: any) {
    this.taming = buildSkyblockSkill("taming", member)
    this.farming = buildSkyblockSkill("farming", member)
    this.mining = buildSkyblockSkill("mining", member)
    this.combat = buildSkyblockSkill("combat", member)
    this.foraging = buildSkyblockSkill("foraging", member)
    this.fishing = buildSkyblockSkill("fishing", member)
    this.enchanting = buildSkyblockSkill("enchanting", member)
    this.alchemy = buildSkyblockSkill("alchemy", member)
    this.carpentry = buildSkyblockSkill("carpentry", member)
    this.runecrafting = buildSkyblockSkill("runecrafting", member)
  }

  get average() {
    const skills = [ this.taming, this.farming, this.mining, this.combat, this.foraging, this.fishing, this.enchanting, this.alchemy ]
    return skills.reduce((prev, cur) => cur?.level ?? 0, 0) / skills.length    
  }
}

function buildSkyblockSkill(skill: string, member: any) {
  return buildSkyblockSkillLike(skill, member[`experience_skill_${skill}`])
}





