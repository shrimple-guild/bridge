import { SkyblockProfile } from "../api/SkyblockProfile.js"

export class SkyblockProfiles {
  readonly profiles: SkyblockProfile[]

  constructor(raw: any, uuid: string) {
    this.profiles = (raw as any[]).map(profile => new SkyblockProfile(profile, uuid))
  }

  get selected() {
    return this.profiles.find(profile => profile.selected) ?? this.profiles[0]
  }

  get bingo() {
    return this.profiles.find(profile => profile.gamemode == "bingo")
  }

  get main() {
    return this.profiles.reduce((prev, cur) => (
      (cur.skyblockLevel ?? 0) > (prev.skyblockLevel ?? 0) ? cur : prev
    ))
  }

}


