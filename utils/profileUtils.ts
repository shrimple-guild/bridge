export function getSkyblockLevel(profile: any, uuid: string): number {
  return (profile.members?.[uuid]?.leveling?.experience ?? 0)
}

export function resolveProfile(profileArg: string, uuid: string, profiles: any[]) {
  let profile
  if (!profileArg) {
    profile = profiles.find(p => p.selected)
  } else if (profileArg === "bingo") {
    profile = profiles.find(p => p.game_mode == "bingo")
  } else if (profileArg === "main") {
    profile = profiles.sort((a, b) => getSkyblockLevel(b, uuid) - getSkyblockLevel(a, uuid))[0]
  } else {
    profile = profiles.find(p => p.cute_name?.toLowerCase() === profileArg)
  }
  if (!profile) {
    throw new Error("Profile could not be determined.")
  }
  return profile
}