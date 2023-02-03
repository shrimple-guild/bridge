async function fetchSkillData() {
  const skillsResponse = await fetch(`https://api.hypixel.net/resources/skyblock/skills`)
  const skillJson = await skillsResponse.json()
  return Object.fromEntries(
    Object.entries(skillJson.skills).map(([skill, data]: [string, any]) => {
      const skillName = skill.toLowerCase()
      const levels = [0, ...data.levels.map((level: any) => level.totalExpRequired)] as number[]
      return [skillName, levels]
    })
  )
}
let skillData = await fetchSkillData()

export function isSkill(skillName: string) {
  return Object.keys(skillData).includes(skillName)
}

export function skillLevel(skill: string, xp: number) {
  const levelXps = skillData[skill]
  if (levelXps == null) throw new Error("Not a known skill!")
  const m = levelXps.length + 1
  const level = ((levelXps.findIndex(levelXp => levelXp > xp) % m) + m) % m - 1
  const xpAtLevel = levelXps[level]
  const xpForNext = (levelXps[level + 1] ?? Infinity)
  const overflow = xp - xpAtLevel 
  const levelFraction = overflow / (xpForNext - xpAtLevel)
  return {
    level: level + levelFraction,
    totalXp: xp,
    xpToNext: xpForNext - xp,
    overflow: overflow,
    maxLevel: levelXps.length - 1
  }
}

