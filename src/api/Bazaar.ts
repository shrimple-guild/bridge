import { HypixelAPI } from "./HypixelAPI.js"
import { SkyblockItems } from "./SkyblockItems.js"
import fuzzy from "fuzzysort"
import { LoggerCategory } from "../utils/Logger.js"
import { deromanize } from "../utils/utils.js"

type BazaarProduct = {
  id: string,
  name: string,
  sellSummary: Summary[],
  buySummary: Summary[]
  instasell?: number,
  instabuy?: number
}

type Summary = {
  amount: number,
  pricePerUnit: number,
  orders: number
}

export class Bazaar {

  fetchProducts: () => Promise<BazaarProduct[]>
  
  constructor(
    private hypixelAPI: HypixelAPI, 
    private skyblockItems: SkyblockItems, 
    private logger: LoggerCategory
  ) {
    this.fetchProducts = (() => {
      let products: Promise<BazaarProduct[]> = Promise.resolve([])
      let lastUpdated: number = 0
      return async () => {
        if ((Date.now() - lastUpdated) < 20000) return products
        lastUpdated = Date.now()
        this.logger.debug("Updating bazaar products because cache expired.")
        products = this.hypixelAPI.fetchHypixel("/skyblock/bazaar").then(({ data }) => {
          const productList = Object.values(data.products) as any[]
          lastUpdated = data.lastUpdated
          return productList.map(productData => ({
            id: productData.product_id,
            name: this.skyblockItems.itemById(productData.product_id),
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
          }))
        }).catch(e => {
          this.logger.warn("Failed to update Bazaar products.")
          this.logger.error(e)
          return products
        }) 
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







