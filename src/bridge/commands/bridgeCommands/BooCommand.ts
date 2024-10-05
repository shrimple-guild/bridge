import { Bridge } from "../../Bridge.js"
import { SimpleCommand } from "./Command.js"

export class BooCommand implements SimpleCommand {
  aliases = ["boo"]
  lastBoo = 0

  constructor(private bridge?: Bridge) {}

  async execute(args: string[]) {
    if (new Date().getMonth() !== 9) return "It's not October! You can't scare people right now."
    if (Date.now() - this.lastBoo < 60000 * 5) return "You're scaring too often! Wait a while before trying again."
    if (args.length > 1) return "Too many arguments!"
    const boop = args[0]
    if (!boop) {
      this.bridge?.chatAsBot("/boo demonhunter990")
    } else {
      this.bridge?.chatAsBot(`/boo ${boop}`)
    }
    this.lastBoo = Date.now()
    return undefined
  }
} 

