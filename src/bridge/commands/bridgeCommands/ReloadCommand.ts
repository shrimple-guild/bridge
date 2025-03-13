import { SimpleCommand } from "./Command.js"
import { Bridge } from "../../Bridge.js"

export class ReloadCommand extends SimpleCommand {
	aliases = ["rlb", "reload", "reloadBot"]

	constructor(private bridge?: Bridge) {
		super()
	}

	async execute(args: string[], isStaff: boolean) {
		if (!this.bridge) this.error("Improperly configured (no bridge)!")
		const isOnline = this.bridge.isBotOnline()
		if (isStaff) {
			if (!isOnline || args[0] == "force") {
				await this.bridge.reload()
			} else {
				return 'Bot might be online! Use "_rlb force" to restart anyway.'
			}
		} else if (!isOnline) {
			await this.bridge.reload()
		} else {
			this.error(
				"No permission! Only staff can use this command unless the bot is known to be offline."
			)
		}
	}
}
