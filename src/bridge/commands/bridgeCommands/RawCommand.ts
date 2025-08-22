import { MessageSource } from "../../../utils/utils.js"
import { Bridge } from "../../Bridge.js"
import { SimpleCommand } from "./Command.js"

export class RawCommand extends SimpleCommand {
	aliases = ["raw"]
	usage = "<data>"

	constructor(private bridge?: Bridge) {
		super()
	}

	async execute(args: string[], isStaff?: boolean) {
		if (!this.bridge) this.error("Improperly configured (no bridge)!")
		if (args.length === 0) this.throwUsageError()
		if (!isStaff) this.error("No permission")
		const message = args.join(" ")
		await this.bridge.chatAsBot(MessageSource.Raw, message)
	}
}
