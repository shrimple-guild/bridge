import { OverflowLevel } from "../utils/Level.js"
import { neuLevelingData } from "../utils/NeuLevelingData.js"

const floors = [0, 1, 2, 3, 4, 5, 6, 7]

const dungeonClasses = ["healer", "archer", "tank", "mage", "berserk"] as const

type DungeonClass = (typeof dungeonClasses)[number]

export function isDungeonClass(str: string): str is DungeonClass {
	return dungeonClasses.includes(str as DungeonClass)
}

export class Dungeons {
	readonly level: OverflowLevel
	readonly classes: {
		readonly healer: OverflowLevel
		readonly archer: OverflowLevel
		readonly tank: OverflowLevel
		readonly mage: OverflowLevel
		readonly berserk: OverflowLevel
	}
	private catacombs: {
		readonly normal: (FloorData | undefined)[]
		readonly master: (FloorData | undefined)[]
	}

	constructor(member: any) {
		const dungeons = member.dungeons
		const experience = dungeons?.dungeon_types?.catacombs?.experience ?? 0
		this.level = neuLevelingData.dungeonCurve.at(experience)
		this.classes = {
			healer: neuLevelingData.dungeonCurve.at(this.getClassExperience(member, "healer")),
			archer: neuLevelingData.dungeonCurve.at(this.getClassExperience(member, "archer")),
			tank: neuLevelingData.dungeonCurve.at(this.getClassExperience(member, "tank")),
			mage: neuLevelingData.dungeonCurve.at(this.getClassExperience(member, "mage")),
			berserk: neuLevelingData.dungeonCurve.at(this.getClassExperience(member, "berserk"))
		}
		this.catacombs = {
			normal: floors.map((floor) =>
				buildFloorData(dungeons?.dungeon_types?.catacombs, floor)
			),
			master: floors.map((floor) =>
				buildFloorData(dungeons?.dungeon_types?.master_catacombs, floor)
			)
		}
	}

	private getClassExperience(member: any, dungeonClass: string): number {
		return member.dungeons?.player_classes?.[dungeonClass]?.experience ?? 0
	}

	floor(mode: "normal" | "master", floor: number) {
		return this.catacombs[mode][floor]
	}

	collection(floor: number) {
		const normalCompletions = this.catacombs["normal"][floor]?.completions ?? 0
		const masterCompletions = this.catacombs["master"][floor]?.completions ?? 0
		return normalCompletions + masterCompletions
	}
}

export type FloorData = {
	completions: number
	pb?: number
	sPb?: number
	sPlusPb?: number
}

function buildFloorData(data: any, floor: number): FloorData | undefined {
	return {
		completions: data?.tier_completions?.[floor] ?? 0,
		pb: data?.fastest_time?.[floor],
		sPb: data?.fastest_time_s?.[floor],
		sPlusPb: data?.fastest_time_s_plus?.[floor]
	}
}
