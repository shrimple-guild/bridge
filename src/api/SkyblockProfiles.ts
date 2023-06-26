import { SkyblockProfile } from "./SkyblockProfile.js"

export class SkyblockProfiles {
  readonly profiles: SkyblockProfile[]

  constructor(raw: any, uuid: string) {
    this.profiles = (raw as any[]).map(profile => new SkyblockProfile(profile, uuid))
  }

  get selected() {
    return this.profiles.find(profile => profile.selected) ?? this.profiles[0]
  }

  get bingo() {
    const profile = this.profiles.find(profile => profile.gamemode == "bingo")
    if (profile == null) throw new Error("Profile does not exist.")
    return profile
  }

  get(name: string) {
    const profile = this.profiles.find(profile => profile.cuteName.toLowerCase() == name.toLowerCase())
    if (profile == null) throw new Error("Profile does not exist.")
    return profile
  }

  getByQuery(query: string | undefined) {
    const queryLowercase = query?.toLowerCase()
    if (queryLowercase == "bingo") return this.bingo
    if (queryLowercase == "main") return this.main
    if (queryLowercase == null) return this.selected
    return this.get(queryLowercase)
  }

  get main() {
    return this.profiles.reduce((prev, cur) => (
      (cur.skyblockLevel ?? 0) > (prev.skyblockLevel ?? 0) ? cur : prev
    ))
  }

}


