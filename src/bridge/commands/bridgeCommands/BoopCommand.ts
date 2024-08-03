import { Bridge } from "../../Bridge.js"
import { SimpleCommand } from "./Command.js"

export class BoopCommand implements SimpleCommand {
  aliases = ["boop"]
  lastBoop = 0

  constructor(private bridge?: Bridge) {}

  async execute(args: string[]) {
    if (Date.now() - this.lastBoop < 60000 * 5) return "You're booping too fast! Wait a while before trying again."
    if (args.length > 1) return "Too many arguments!"
    const boop = args[0]
    if (!boop) {
      this.bridge?.chatAsBot("/boop demonhunter990")
    } else {
      this.bridge?.chatAsBot(`/boop ${boop}`)
    }
    this.lastBoop = Date.now()
    return undefined
  }
} 

