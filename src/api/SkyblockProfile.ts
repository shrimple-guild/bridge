import { Bestiary } from "./Bestiary.js"
import { Collections } from "./Collections.js"
import { Dungeons } from "./Dungeons.js"
import { FarmingWeight, farmingWeight } from "./FarmingWeight.js"
import { HypixelAPI } from "./HypixelAPI.js"
import { Kuudra } from "./Kuudra.js"
import { Mobs } from "./Mobs.js"
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

	readonly memberRaw: any
	readonly skills: Skills
	readonly dungeons: Dungeons
	readonly slayers: Slayers
	readonly trophyFish: TrophyFish
	readonly kuudra: Kuudra
	readonly mobs: Mobs
	readonly bestiary: Bestiary
	readonly collections: Collections
	readonly farmingWeight?: FarmingWeight

	constructor(raw: any, uuid: string, api: HypixelAPI) {
		this.memberRaw = raw.members[uuid]
		this.profileId = raw.profile_id
		this.cuteName = raw.cute_name
		this.lastSave = new Date(raw.last_save)
		this.selected = raw.selected
		this.gamemode = raw.game_mode ?? "normal"

		this.skyblockLevel = this.memberRaw.leveling?.experience
		this.skills = new Skills(this.memberRaw)
		this.dungeons = new Dungeons(this.memberRaw)
		this.slayers = new Slayers(this.memberRaw)
		this.trophyFish = new TrophyFish(this.memberRaw)
		this.kuudra = new Kuudra(this.memberRaw)
		this.mobs = new Mobs(this.memberRaw)

		// TODO make sure an instance always exists (this may be undefined on old profiles)
		this.bestiary = new Bestiary(this.memberRaw)
		this.collections = new Collections(this.memberRaw, api)
		this.farmingWeight = farmingWeight(raw, uuid)
	}
}
