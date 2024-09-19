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
  "runecrafting",
  "carpentry"
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
    this.taming = buildSkyblockSkill("TAMING", member)
    this.farming = buildSkyblockSkill("FARMING", member)
    this.mining = buildSkyblockSkill("MINING", member)
    this.combat = buildSkyblockSkill("COMBAT", member)
    this.foraging = buildSkyblockSkill("FORAGING", member)
    this.fishing = buildSkyblockSkill("FISHING", member)
    this.enchanting = buildSkyblockSkill("ENCHANTING", member)
    this.alchemy = buildSkyblockSkill("ALCHEMY", member)
    this.carpentry = buildSkyblockSkill("CARPENTRY", member)
    this.runecrafting = buildSkyblockSkill("RUNECRAFTING", member)
  }

  get average() {
    const skills = [ this.taming, this.farming, this.mining, this.combat, this.foraging, this.fishing, this.enchanting, this.alchemy ]
    return skills.reduce((prev, cur) => cur?.level ?? 0, 0) / skills.length    
  }
}

function buildSkyblockSkill(skill: string, member: any) {
  return buildSkyblockSkillLike(skill.toLowerCase(), member.player_data?.experience?.[`SKILL_${skill}`])
}





