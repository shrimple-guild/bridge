import { HypixelAPI } from "./HypixelAPI.js"
import { SkyblockItems } from "./SkyblockItems.js"
import fuzzy from "fuzzysort"
import { LoggerCategory } from "../utils/Logger.js"
import { deromanize } from "../utils/Utils.js"

type BazaarProduct = {
  id: string,
  name: string,
  instabuy?: number,
  instasell?: number
}

export class Bazaar {

  fetchProducts: () => Promise<BazaarProduct[]>
  
  constructor(
    private hypixelAPI: HypixelAPI, 
    private skyblockItems: SkyblockItems, 
    private logger: LoggerCategory
  ) {
    this.fetchProducts = (() => {
      let products: BazaarProduct[] = []
      let lastUpdated: number = 0
      return async () => {
        try {
          if ((Date.now() - lastUpdated) > 20000) {
            this.logger.debug("Updating bazaar products because cache expired.")
            const { data } = await this.hypixelAPI.fetchHypixel("/skyblock/bazaar")
            const productList = Object.values(data.products) as any[]
            products = productList.map(productData => ({
              id: productData.product_id,
              name: this.skyblockItems.itemName(productData.product_id),
              instasell: productData.sell_summary[0]?.pricePerUnit,
              instabuy: productData.buy_summary[0]?.pricePerUnit
            }))
            lastUpdated = data.lastUpdated
            return products
          }
        } catch(e) {
          this.logger.warn("Failed to update Bazaar products.")
        }
        return products
      }
    })()
  }

  async getProduct(name: string): Promise<BazaarProduct | undefined> {
    const products = await this.fetchProducts()
    return products.find(product => product.name == name)
  }

  async getClosestProduct(name: string): Promise<BazaarProduct | undefined> {
    const products = await this.fetchProducts()
    const split = name.lastIndexOf(" ")
    const query = `${name.slice(0, split)} ${deromanize(name.slice(split + 1))}`
    return fuzzy.go(query, products, { key: "name", limit: 1 })[0]?.obj
  }
}









