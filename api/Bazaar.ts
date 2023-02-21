import { HypixelAPI } from "./HypixelAPI.js"
import { SkyblockItems } from "./SkyblockItems.js"
import fuzzy from "fuzzysort"
import { LoggerCategory } from "../utils/Logger.js"


type BazaarProduct = {
  id: string,
  name: string,
  instabuy?: number,
  instasell?: number
}

export class Bazaar {

  private products: BazaarProduct[] = []

  private constructor(
    private hypixelAPI: HypixelAPI, 
    private skyblockItems: SkyblockItems, 
    private logger: LoggerCategory
  ) {}

  static async create(hypixelAPI: HypixelAPI, skyblockItems: SkyblockItems, logger: LoggerCategory) {
    const bazaar = new Bazaar(hypixelAPI, skyblockItems, logger)
    await bazaar.update()
    return bazaar
  }

  async update() {
    try {
      const productResponse = await this.hypixelAPI.fetchHypixel("/skyblock/bazaar")
      const productList = Object.values(productResponse.products) as any[]
      this.products = productList.map(productData => ({
        id: productData.product_id,
        name: this.skyblockItems.itemName(productData.product_id),
        instasell: productData.sell_summary[0]?.pricePerUnit,
        instabuy: productData.buy_summary[0]?.pricePerUnit
      }))
    } catch (e) {
      this.logger.error("Error while updating bazaar!", e)
    }
    setTimeout(this.update, 60000)
  }

  getProduct(name: string) {
    return this.products.find(product => product.name == name)
  }

  getClosestProduct(name: string): BazaarProduct | undefined {
    return fuzzy.go(name, this.products, { key: "name", limit: 1 })[0]?.obj
  }
}









