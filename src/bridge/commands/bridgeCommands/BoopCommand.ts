import { MessageSource } from "../../../utils/utils.js"
import { Bridge } from "../../Bridge.js"
import { SimpleCommand } from "./Command.js"

export class BoopCommand extends SimpleCommand {
	aliases = ["boop"]
	lastBoop = 0

	constructor(private bridge?: Bridge) {
		super()
	}

	async execute(args: string[]) {
		if (Date.now() - this.lastBoop < 60000 * 5)
			this.error("You're booping too fast! Wait a while before trying again.")
		if (!this.bridge) this.error("Bridge not set.")

		const boop = args[0]
		if (!boop) {
			this.bridge.chatAsBot(MessageSource.Raw, "/boop demonhunter990")
		} else {
			this.bridge.chatAsBot(MessageSource.Raw, `/boop ${boop}`)
		}
		this.lastBoop = Date.now()
	}
}
