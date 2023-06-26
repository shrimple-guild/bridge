import { Bridge } from "../../Bridge.js"
import { SimpleCommand } from "./Command.js"

export class RawCommand implements SimpleCommand {
    aliases = ["raw"]
    usage = "<data>"

    constructor(private bridge?: Bridge) {}

    async execute(args: string[], isStaff?: boolean) {
      if (!this.bridge) return "Improperly configured (no bridge)!"
      if (args.length === 0) return "You need to give me some data to parse."
      if (!isStaff) return "No permission"
      const message = args.join(" ")
      this.bridge.chatAsBot(message)
    }
} 