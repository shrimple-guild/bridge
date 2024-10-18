import { SimpleCommand } from "./Command.js"
import { randItem } from "../../../utils/utils.js"

export class PickCommand extends SimpleCommand {
    aliases = ["pick", "choose"]
    usage = "<option1> <option2> [option3] ..."

    async execute(args: string[]) {
        if (args.length == 0) this.throwUsageError()
        return `I choose ${randItem(args)}`
    }
}