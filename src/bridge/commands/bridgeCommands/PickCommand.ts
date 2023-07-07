import { SimpleCommand } from "./Command.js"
import { randItem, randRange } from "../../../utils/utils.js"

export class PickCommand implements SimpleCommand {
    aliases = ["pick", "choose"]
    usage = "<option1> <option2> [option3] ..."

    async execute(args: string[]) {
        if (args.length == 0) return "You need to give me some options to choose from."
        return `I choose ${randItem(args)}`
    }
}