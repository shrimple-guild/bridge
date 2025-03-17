import fuzzysort from "fuzzysort"
import { stripColorCodes } from "../utils/utils.js"
import { bestiary as neuBestiaryData, TypeData } from "./BestiaryRepoNEU.js"

type BestiaryRes = {
	migrated_stats: boolean
	migration: boolean
	kills: { [key: string]: number }
	deaths: { [key: string]: number }
}

export class Bestiary {
	data: TypeData[] = []

	constructor(member: any) {
		if (!member) return
		if (!member.bestiary) return
		if (!neuBestiaryData) return
		const bestiaryData = member.bestiary as BestiaryRes
		for (const type of neuBestiaryData.types) {
			let typeIterator = type.hasSubcategories ? type.subcategories : [type]
			for (const typeIterable of typeIterator) {
				const islandObj: TypeData = {
					name: typeIterable.name,
					mobs: [],
					hasSubcategories: false,
					subcategories: []
				}
				if (typeIterable.mobs) {
					for (const mob of typeIterable.mobs) {
						const cleanedName = stripColorCodes(mob.name)
						let mobObj = islandObj.mobs.find(
							(islandMob) => islandMob.name === cleanedName
						)
						if (!mobObj) {
							mobObj = {
								name: cleanedName,
								cap: mob.cap,
								mobs: mob.mobs,
								bracket: mob.bracket,
								kills: 0,
								deaths: 0,
								kdr: undefined
							}
							islandObj.mobs.push(mobObj)
						}
						for (const mobId of mob.mobs) {
							mobObj.kills += bestiaryData.kills?.[mobId] ?? 0
							mobObj.deaths += bestiaryData.deaths?.[mobId] ?? 0
						}
						if (mobObj.deaths) mobObj.kdr = mobObj.kills / mobObj.deaths
					}
				}
				this.data.push(islandObj)
			}
		}
	}

	getByIsland(island: string) {
		return this.data.find(
			(data) =>
				data.name.toLowerCase() === island.toLowerCase() ||
				data.name.toLowerCase().includes(island.toLowerCase())
		)
	}

	getByMob(mob: string) {
		const mobs = this.data.flatMap((islandData) => islandData.mobs)
		const searchResult = fuzzysort.go(mob, mobs, { key: "name" })
		return searchResult.at(0)?.obj
	}
}
