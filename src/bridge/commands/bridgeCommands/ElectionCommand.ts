import { SimpleCommand } from "./Command.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"
import ElectionCommandHelper from "./ElectionCommandHelper.js"

export class ElectionCommand extends SimpleCommand {
	aliases = ["election", "mayor"]

	usage = "[mayor]"

	constructor(private hypixelAPI: HypixelAPI) {
		super()
	}

	async execute(args: string[]) {
		if (!args.length) {
			const electionData = await this.hypixelAPI.fetchElections()
			if (!electionData.success) this.error("Hypixel API error! Try again later.")
			return ElectionCommandHelper.getMayorSummary(electionData)
		} else {
			let mayorQuery = args.join(" ").toLowerCase()
			return ElectionCommandHelper.getSpecial(mayorQuery)
		}
	}
}
