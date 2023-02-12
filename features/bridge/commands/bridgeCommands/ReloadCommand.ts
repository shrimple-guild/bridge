import { BridgeCommand } from "./Command.js"
import { Bridge } from "../../Bridge.js"

export class ReloadCommand implements BridgeCommand {
    aliases = ["reloadbot", "reload", "rlb"]

    async execute(bridge: Bridge, args: string[], isStaff: boolean) {
      if (!isStaff) return "No permission"
      await bridge.reload()
    }
}