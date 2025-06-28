type Perk = {
	name: string
	description: string
	minister?: boolean
}

type Candidate = {
	key: string
	name: string
	perks: Perk[]
	votes?: number
}

type Minister = {
	key: string
	name: string
	perk: Perk
}

type Election = {
	year: number
	candidates: Candidate[]
}

type Mayor = {
	key: string
	name: string
	perks: Perk[]
	minister?: Minister
	election: Election
}

type ElectionResponse = {
	success: boolean
	lastUpdated: number
	mayor: Mayor
	current?: Election
}
