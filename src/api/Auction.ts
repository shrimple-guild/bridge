import { romanize } from "romans";
import { LoggerCategory } from "../utils/Logger.js";
import { isInteger, jaroDistance, stripColorCodes } from "../utils/utils.js";
import { HypixelAPI } from "./HypixelAPI.js";
import { SkyblockItems } from "./SkyblockItems.js";

const star = '✪';
const masterStars = ['➊', '➋', '➌', '➍', '➎'];

export const reforges: string[] = [];
export const itemNames: string[] = [];

type AuctionResponse = {
    page: number;
    totalPages: number;
    totalAuctions: number;
    lastUpdated: number;
    auctions: AuctionItem[];
}

export type AuctionItem = {
    // Hypixel api data
    uuid: string;
    start: number;
    end: number;
    item_name: string;
    item_lore: string;
    extra: string;
    category: string;
    tier: string;
    starting_bid: number;
    claimed: boolean;
    bin: boolean;

    // Extra fields
    reforge: string;
    displayName: string;
    starCount: number;
}

export class Auction {
    private lastUpdated: number = -1;
    private lastItems: AuctionItem[] | null = null;

    constructor(
        private hypixelApi: HypixelAPI,
        private items: SkyblockItems,
        private logger: LoggerCategory
    ) { }

    //Flags (optional):
    // -r:reforge
    // -s:stars(0-10, normal+master)
    // -t:tooltip_part,... (will romanize)
    async getClosestAuctionProduct(item: string, flags: Record<string, string>) {
        const items = await this.getAuctionItems();
        const exactMatch = await this.tryFindExact(items, item, flags);
        if (exactMatch) {
            return exactMatch;
        } else if (Object.keys(flags).length) {
            throw new Error("No exact match found.");
        }

        return this.tryFindClosest(items, item);
    }

    tryFindClosest(auctions: AuctionItem[], item: string) {
        const split = item.split(" ");
        const filtered = auctions.filter(auction => {
            return split.some(part => auction.displayName.toLowerCase().includes(part.toLowerCase()));
        });
        if (filtered.length > 0) {
            return filtered[0];
        } else {
            return auctions.sort((a, b) => jaroDistance(a.displayName, item) - jaroDistance(b.displayName, item))[0];
        }
    }

    async tryFindExact(auctions: AuctionItem[], item: string, flags: Record<string, string>) {
        const itemName = this.items.itemById(item);

        const reforge = flags["r"];
        const starCount = +flags["s"];
        const tooltip = flags["t"];

        const filtered = auctions.filter(auction => {
            if (auction.displayName === itemName) {
                if (reforge && auction.reforge !== reforge) {
                    return false;
                }

                if (starCount && auction.starCount !== starCount) {
                    return false;
                }

                if (tooltip) {
                    const romanized = tooltip.split(",").map(part => {
                        return part.trim().split(" ").map(word => isInteger(word) ? romanize(+word) : word).join(" ");
                    })
                    return romanized.every(part => auction.item_lore.includes(part));
                }
                return true;
            }
        });
        if (filtered.length > 0) {
            return filtered[0];
        } else {
            return null;
        }
    }

    async getAuctionItems() {
        const updatedCheck = await this.fetchAuction();
        if (this.lastUpdated !== updatedCheck.lastUpdated) {
            await this.fetchAuctionItems();
        }
        return this.lastItems ?? [];
    }

    private async fetchAuctionItems() {
        const response = await this.fetchAuction();
        this.lastUpdated = response.lastUpdated;
        const totalPages = response.totalPages;
        let promises = new Array<Promise<AuctionResponse>>(totalPages);
        for (let i = 1; i <= totalPages; i++) {
            promises.push(this.fetchAuction(i));
        }
        const responses = await Promise.all(promises);
        response.auctions.push(...responses.flatMap(res => res.auctions));

        //Transform data
        response.auctions = response.auctions.filter(auction => auction.bin && !auction.claimed);
        response.auctions.sort((a, b) => a.starting_bid - b.starting_bid);
        response.auctions.forEach(auction => this.fixRepoItem(auction));
    }

    private async fetchAuction(page?: number): Promise<AuctionResponse> {
        const { data } = await this.hypixelApi.fetchHypixel("/skyblock/auctions", {
            page: page
        });
        return data as AuctionResponse;
    }

    private fixRepoItem(item: AuctionItem) {
        //Handle special reforges
        item.item_name = item.item_name.replace("Not So", "Light").replace("Extremely", "Heavy").replace("Very", "Wise");
        item.item_lore = stripColorCodes(item.item_lore)

        const clean = item.item_name.split(" ").filter(part => !part.startsWith(star)).join(" ");
        const repoItem = this.items.itemByName(clean);
        if (repoItem) {
            item.displayName = repoItem;
            item.reforge = clean.replace(repoItem, "").trim();

            const masterStarCount = masterStars.indexOf(item.displayName.slice(-1)) + 1;

            if (masterStarCount > 0) {
                item.starCount = 5 + masterStarCount;
            } else {
                item.starCount = item.item_name.split("").filter(name => name === star).length;
            }
        }
    }
}