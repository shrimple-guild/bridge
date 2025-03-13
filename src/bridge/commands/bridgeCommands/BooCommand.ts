import { Bridge } from "../../Bridge.js"
import { SimpleCommand } from "./Command.js"

export class BooCommand extends SimpleCommand {
	aliases = ["boo"]
	lastBoo = 0

	constructor(private bridge?: Bridge) {
		super()
	}

	async execute(args: string[]) {
		if (new Date().getMonth() !== 9)
			this.error("It's not October! You can't scare people right now.")
		if (Date.now() - this.lastBoo < 60000 * 5)
			this.error("You're scaring too often! Wait a while before trying again.")
		if (!this.bridge) this.error("Bridge not set.")

		const spook = args[0]
		if (!spook) {
			this.bridge.chatAsBot("/boo demonhunter990")
		} else {
			this.bridge.chatAsBot(`/boo ${spook}`)
		}
		this.lastBoo = Date.now()
	}
}
