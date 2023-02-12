import leveling from "../data/leveling.json" assert { type: "json" }

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

while (leveling.dungeons.length <= 100) {
  leveling.dungeons.push(leveling.dungeons.at(-1)! + 200e6)
}

export const skillData = { ...(await fetchSkillData()), ...leveling } as {[key: string]: number[]}
