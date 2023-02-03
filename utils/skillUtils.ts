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
  if (!levelXps) throw new Error("Not a known skill!")
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

const cataXpNonCumulative: { [key: number]: number } = {
  1: 50,
  2: 75,
  3: 110,
  4: 160,
  5: 230,
  6: 330,
  7: 470,
  8: 670,
  9: 950,
  10: 1340,
  11: 1890,
  12: 2665,
  13: 3760,
  14: 5260,
  15: 7380,
  16: 10300,
  17: 14400,
  18: 20000,
  19: 27600,
  20: 38000,
  21: 52500,
  22: 71500,
  23: 97000,
  24: 132000,
  25: 180000,
  26: 243000,
  27: 328000,
  28: 445000,
  29: 600000,
  30: 800000,
  31: 1065000,
  32: 1410000,
  33: 1900000,
  34: 2500000,
  35: 3300000,
  36: 4300000,
  37: 5600000,
  38: 7200000,
  39: 9200000,
  40: 12000000,
  41: 15000000,
  42: 19000000,
  43: 24000000,
  44: 30000000,
  45: 38000000,
  46: 48000000,
  47: 60000000,
  48: 75000000,
  49: 93000000,
  50: 116250000,
}

for (let i = 51; i <= 99; i++) {
  cataXpNonCumulative[i] = 200000000;
}

export function cataLevel(xp: number) {
  let level = 0;
  let xpToNext = cataXpNonCumulative[1];
  while (xp >= xpToNext) {
    xp -= xpToNext;
    level++;
    xpToNext = cataXpNonCumulative[level + 1];
  }
  return {
    level: level + xp / xpToNext,
    totalXp: xp,
    xpToNext: xpToNext - xp,
    overflow: xp,
    maxLevel: 99
  }
}