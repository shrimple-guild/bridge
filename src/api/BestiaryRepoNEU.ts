export type BestiaryData = {
	brackets: { [key: string]: number[] }
	types: TypeData[]
}

export type TypeData = {
	name: string
	mobs: MobData[]
	hasSubcategories: boolean
	subcategories: TypeData[]
}

export type MobData = {
	name: string
	cap: number
	mobs: string[]
	bracket: number
	kills: number
	deaths: number
	kdr: number | undefined
}

async function fetchData() {
	const data = await fetch(
		"https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/master/constants/bestiary.json"
	).then((res) => res.json())
	const jsonData = Object.values(data) as any[]
	const brackets = jsonData.shift() as { [key: string]: number[] }
	const types = jsonData as TypeData[]
	for (const type of types) {
		if (type.hasSubcategories) {
			type.subcategories = []
			const fromObj = Object.values(type) as any[]
			for (const from of fromObj) {
				if (from.mobs) {
					type.subcategories.push(from)
				}
			}
		}
	}
	return {
		brackets: brackets,
		types: types
	} as BestiaryData
}

export let bestiary = await fetchData()
