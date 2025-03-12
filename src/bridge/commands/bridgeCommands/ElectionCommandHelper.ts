import {
	HumanizeDurationLanguage,
	HumanizeDuration
} from "humanize-duration-ts"
import { jaroDistance, titleCase } from "../../../utils/utils.js"

class ElectionCommandHelper {
	skyblockEpoch = 1560275700000
	electionOver = 105600000
	year = 1000 * 50 * 24 * 31 * 12

	langService = new HumanizeDurationLanguage()
	humanizer = new HumanizeDuration(this.langService)

	constructor() {}

	private nextRecurringEvent(
		epoch: number,
		offset: number,
		interval: number
	) {
		return interval - ((Date.now() - (epoch + offset)) % interval)
	}

	private mayorNameWithPerks(mayor: Mayor | Candidate | Minister) {
		const name = mayor.name
		// @ts-ignore
		const perks: Perk[] = mayor.perks ?? [mayor.perk]
		const allMayorPerks = mayorPerks[name]
		const mayorPerkCount = allMayorPerks
			? Object.keys(allMayorPerks).length
			: 0
		let perkSummary
		if (mayorPerkCount == perks.length) {
			perkSummary = "all perks"
		} else {
			perkSummary = perks
				.map((perk) => getPerkShortName(mayor, perk))
				.join(", ")
		}
		return `${name}[${perkSummary}]`
	}

	private getNextSpecials() {
		return [
			{
				name: "scorpius",
				time: this.nextRecurringEvent(
					this.skyblockEpoch,
					this.electionOver,
					this.year * 24
				)
			},
			{
				name: "derpy",
				time: this.nextRecurringEvent(
					this.skyblockEpoch,
					this.electionOver + this.year * 8,
					this.year * 24
				)
			},
			{
				name: "jerry",
				time: this.nextRecurringEvent(
					this.skyblockEpoch,
					this.electionOver + this.year * 16,
					this.year * 24
				)
			}
		]
	}

	getMayorSummary(electionData: ElectionResponse) {
		const nextElection = this.nextRecurringEvent(
			this.skyblockEpoch,
			this.electionOver,
			this.year
		)
		const currentMayor = this.mayorNameWithPerks(electionData.mayor)
		const currentMinister = this.mayorNameWithPerks(
			electionData.mayor.minister
		)

		const currentSummary = `Current: ${currentMayor} + ${currentMinister}`

		const candidates = electionData.current?.candidates || []
		const sortedCandidates = candidates.sort(
			(a, b) => (b.votes || 0) - (a.votes || 0)
		)

		let nextSummary = "Next: "
		if (
			sortedCandidates &&
			sortedCandidates.some((candidate) => candidate.votes)
		) {
			let nextMayor = this.mayorNameWithPerks(sortedCandidates[0])
			let nextMinister = this.mayorNameWithPerks(sortedCandidates[1])
			if (nextMayor && nextMinister) {
				nextSummary += `${nextMayor} + ${nextMinister}`
			}
		} else {
			nextSummary += "unknown"
		}

		nextSummary += ` in ${this.humanizer.humanize(nextElection, { largest: 2, delimiter: " " })}`

		let response = `${currentSummary}. ${nextSummary}. `

		let nextSpecial = this.getNextSpecials().sort(
			(a, b) => a.time - b.time
		)[0]
		response += `Next special: ${titleCase(nextSpecial.name)}, in ${this.humanizer.humanize(nextSpecial.time, { largest: 2, delimiter: " " })}.`
		return response
	}

	getSpecial(mayorQuery: string) {
		let nextSpecial = this.getNextSpecials().sort(
			(a, b) =>
				jaroDistance(mayorQuery, b.name) -
				jaroDistance(mayorQuery, a.name)
		)[0]
		return `${titleCase(nextSpecial.name)} in ${this.humanizer.humanize(nextSpecial.time, { largest: 3, delimiter: " " })}.`
	}
}

function getPerkShortName(
	mayor: Mayor | Candidate | Minister,
	perk: Perk
): string {
	const mayorName = mayor.name
	if (mayorName == "Foxy" && perk.name == "Extra Event") {
		const matcher =
			/Schedules an extra §[\da-f]([\w\s]+) §7event during the year./.exec(
				perk.description
			)
		if (matcher) {
			return extraEventShortNames[matcher[1]] ?? matcher[1].toLowerCase()
		} else {
			console.error(`Unknown extra event ${perk.description}`)
			return "extra event"
		}
	}
	const perkShortName = mayorPerks?.[mayorName]?.[perk.name]
	if (!perkShortName) {
		console.error(`Unknown perk ${perk.name} (mayor ${mayorName})`)
		return perk.name.toLowerCase()
	}
	return perkShortName
}

const extraEventShortNames: Record<string, string | undefined> = {
	"Mining Fiesta": "fiesta",
	"Spooky Festival": "spooky",
	"Fishing Festival": "sharki"
}

const mayorPerks: Record<
	string,
	Record<string, string | undefined> | undefined
> = {
	Aatrox: {
		"SLASHED Pricing": "cheaper slayers",
		"Slayer XP Buff": "slayer xp",
		Pathfinder: "rare drops"
	},
	Cole: {
		Prospection: "minions",
		"Mining XP Buff": "wisdom",
		"Mining Fiesta": "fiesta",
		"Molten Forge": "forge"
	},
	Diana: {
		"Lucky!": "pet luck",
		"Mythological Ritual": "mythos",
		"Pet XP Buff": "pet xp",
		"Sharing is Caring": "exp share"
	},
	Diaz: {
		"Shopping Spree": "npc limit",
		"Volume Trading": "volume trading",
		"Stock Exchange": "stonk auction",
		"Long Term Investment": "long term investment"
	},
	Finnegan: {
		"Pelt-pocalypse": "pelts",
		GOATed: "contests",
		"Blooming Business": "new visitors",
		"Pest Eradicator": "pests"
	},
	Foxy: {
		"Sweet Benevolence": "extra event drops",
		"A Time for Giving": "party",
		"Chivalrous Carnival": "carnival",
		"Extra Event (Mining)": "fiesta",
		"Extra Event (Fishing)": "fishing festival",
		"Extra Event (Spooky)": "spooky fest"
	},
	Marina: {
		"Fishing XP Buff": "fishing xp",
		"Luck of the Sea 2.0": "scc",
		"Fishing Festival": "festival",
		"Double Trouble": "double hook"
	},
	Paul: {
		Marauder: "cheaper chest",
		EZPZ: "ezpz",
		Benediction: "blessing"
	}
}

export default new ElectionCommandHelper()
