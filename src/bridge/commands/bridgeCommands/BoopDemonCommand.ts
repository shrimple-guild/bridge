import { Bridge } from "../../Bridge.js"
import { SimpleCommand } from "./Command.js"

export class BoopDemonCommand implements SimpleCommand {
  aliases = ["boop", "boopdemon", "bd"]
  usage = "boop!"

  constructor(private bridge?: Bridge) {}

  async execute(args: string[]) {
    this.bridge?.chatAsBot("/boop demonhunter990")
    return "Booped!"
  }
} 

