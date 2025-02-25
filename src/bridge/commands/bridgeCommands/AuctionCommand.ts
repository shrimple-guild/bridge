import { SimpleCommand } from "./Command.js"
import { HypixelAPI } from "../../../api/HypixelAPI.js"

export class AuctionCommand extends SimpleCommand {
  aliases = ["lbin", "lowestbin", "ah", "lb"]

  usage = "<item name> [-r:reforge -s:stars -t:tooltip_part,...]"

  constructor(private hypixelAPI: HypixelAPI) {
    super()
  }

  async execute(args: string[]) {
    let formatter = Intl.NumberFormat("en", { notation: "compact" })
    if (!args.length) this.throwUsageError();
    if (!this.hypixelAPI.auction) this.error("Auction API not initialized");
    const flags = this.parseFlags(args.join(" "))
    let cleaned = args.join(" ");
    for (const flag of Object.entries(flags)) {
      cleaned = cleaned.replace(`-${flag[0]}:${flag[1]}`, "").trim()
    }
    const item = await this.hypixelAPI.auction.getClosestAuctionProduct(cleaned, flags)
    let name = item.reforge ? `${item.reforge} ${item.displayName}` : item.displayName
    if (item.starCount) name = `${name} (${item.starCount}✪)`
    return `Lowest BIN for ${name} is ${formatter.format(item.starting_bid)}`
  }

  parseFlags(input: string) {
    const regex = /(?:^|\s)-([A-Za-z]+):([A-Za-z0-9]+)(?=\s|$)/g;
    const flags: Record<string, string> = {};
    let match;
    while ((match = regex.exec(input)) !== null) {
      const flag = match[1];
      const value = match[2];
      flags[flag] = value;
    }
    return flags;
  }
}
