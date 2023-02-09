import { Dungeons } from "./Dungeons.js"
import { Skills } from "./Skills.js"
import { Slayers } from "./Slayers.js"
import { TrophyFish } from "./TrophyFish.js"

export class SkyblockProfile {
  readonly profileId: string
  readonly cuteName: string
  readonly lastSave: Date
  readonly selected: boolean
  readonly skyblockLevel: number | undefined
  readonly gamemode: "normal" | "bingo" | "ironman" | "stranded"

  readonly skills: Skills
  readonly dungeons: Dungeons
  readonly slayers: Slayers
  readonly trophyFish: TrophyFish



  constructor(raw: any, uuid: string) {
    const member = raw.members[uuid]
    this.profileId = raw.profile_id
    this.cuteName = raw.cute_name
    this.lastSave = new Date(raw.last_save)
    this.selected = raw.selected
    this.gamemode = raw.game_mode ?? "normal"

    this.skyblockLevel = member.leveling?.experience
    this.skills = new Skills(member)
    this.dungeons = new Dungeons(member)
    this.slayers = new Slayers(member)
    this.trophyFish = new TrophyFish(member)
  }
}


