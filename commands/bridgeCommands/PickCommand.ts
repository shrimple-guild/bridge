import { BridgeCommand } from "./Command.js"
import { randRange } from "../../utils/Utils.js"

export class PickCommand implements BridgeCommand {
    aliases = ["pick", "choose"]
    usage = "<option1> <option2> [option3] ..."

    execute(args: string[]) {
        if (args.length == 0) return "You need to give me some options to choose from."
        return `I choose ${args[randRange(0, args.length - 1)]}`
    }
}