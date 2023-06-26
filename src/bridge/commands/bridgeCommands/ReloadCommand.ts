import { SimpleCommand } from "./Command.js"
import { Bridge } from "../../Bridge.js"

export class ReloadCommand implements SimpleCommand {
    aliases = ["reloadbot", "reload", "rlb"]

    constructor(private bridge?: Bridge) {}

    async execute(args: string[], isStaff: boolean) {
      if (!this.bridge) return "Improperly configured (no bridge)!"
      if (!isStaff) return "No permission"
      await this.bridge.reload()
    }
}