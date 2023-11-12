import { HypixelAPI } from "./HypixelAPI";
import { SkyblockItems } from "./SkyblockItems";
import fuzzy from "fuzzysort";
import { LoggerCategory } from "../utils/Logger";
import { deromanize } from "../utils/utils";

type BazaarProduct = {
	id: string;
	name: string;
	sellSummary: Summary[];
	buySummary: Summary[];
	instasell?: number;
	instabuy?: number;
};

type Summary = {
	amount: number;
	pricePerUnit: number;
	orders: number;
};

export class Bazaar {
	private cachedProductList: BazaarProduct[] = [];
	private productListExpiresAt = 0;

	public async fetchProducts(): Promise<BazaarProduct[]> {
		if (this.productListExpiresAt > Date.now()) {
			return this.cachedProductList;
		}

		this.logger.debug("Updating bazaar products because cache expired.");
		try {
			const data = await this.hypixelAPI.fetchHypixel("/skyblock/bazaar");

			// TODO: Give this a type.
			const products = Object.values<any>(data.data.products);

			if (!products || !Array.isArray(products)) {
				console.log(products);
				throw new Error("products not defined or non-array like object.");
			}

			const formattedProducts: BazaarProduct[] = products.map(
				(productData) => ({
					id: productData.product_id,
					name: this.skyblockItems.itemName(productData.product_id),
					sellSummary: productData.sell_summary.map((summary: any) => ({
						amount: summary.amount,
						pricePerUnit: summary.pricePerUnit,
						orders: summary.orders
					})),
					buySummary: productData.buy_summary.map((summary: any) => ({
						amount: summary.amount,
						pricePerUnit: summary.pricePerUnit,
						orders: summary.orders
					})),
					instasell: productData.sell_summary[0]?.pricePerUnit,
					instabuy: productData.buy_summary[0]?.pricePerUnit
				})
			);

			this.cachedProductList = formattedProducts;
			this.productListExpiresAt = Date.now() + 20000;
		} catch (err) {
			this.logger.error("Failed to update Bazaar products.", err);
		}

		return this.cachedProductList;
	}

	async getProduct(name: string): Promise<BazaarProduct | undefined> {
		const products = await this.fetchProducts();
		return products.find((product) => product.name == name);
	}

	async getClosestProduct(name: string): Promise<BazaarProduct | undefined> {
		const products = await this.fetchProducts();
		const split = name.lastIndexOf(" ");
		const query = `${name.slice(0, split)} ${deromanize(
			name.slice(split + 1)
		)}`;
		return fuzzy.go(query, products, { key: "name", limit: 1 })[0]?.obj;
	}

	constructor(
		private hypixelAPI: HypixelAPI,
		private skyblockItems: SkyblockItems,
		private logger: LoggerCategory
	) {}
}
