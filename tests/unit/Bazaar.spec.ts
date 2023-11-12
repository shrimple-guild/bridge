import { Bazaar } from "../../src/api/Bazaar";
import { HypixelAPI } from "../../src/api/HypixelAPI";
import { SkyblockItems } from "../../src/api/SkyblockItems";
import { Logger, LoggerCategory } from "../../src/utils/Logger";

describe("Bazaar", () => {
	let mockHypixelApi: HypixelAPI;
	let mockSkyblockItems: SkyblockItems;
	let mockLogCategory: LoggerCategory;

	beforeAll(() => {
		mockHypixelApi = <any>{
			fetchHypixel: jest.fn().mockResolvedValue(mockResponse)
		} as HypixelAPI;
		mockSkyblockItems = <any>{
			itemName: jest.fn().mockReturnValue("Example Name"),
		} as SkyblockItems; 
		mockLogCategory = new Logger().category("Mock Logger");
  });

	it("Should return a formatted list of hypixel bazaar products.", async () => {
    const testProduct = mockResponse.data.products.TestItem;

    const result = new Bazaar(mockHypixelApi, mockSkyblockItems, mockLogCategory).fetchProducts();
    await expect(result).resolves.toEqual([
      {
        id: testProduct.product_id,
        name: "Example Name",
        sellSummary: testProduct.sell_summary,
        buySummary: testProduct.buy_summary,
        instasell: testProduct.sell_summary[0].pricePerUnit,
        instabuy: testProduct.buy_summary[0].pricePerUnit
      }
    ]);
  });


	describe("Caching", () => {
		it("Should cache the product list if updated at is less than 20,000", async () => {
			const testProduct = mockResponse.data.products.TestItem;
			const bazaar = new Bazaar(mockHypixelApi, mockSkyblockItems, mockLogCategory);
	
			const result = bazaar.fetchProducts();
			const oldId = testProduct.product_id;
			await expect(result).resolves.toEqual([
				{
					id: testProduct.product_id,
					name: "Example Name",
					sellSummary: testProduct.sell_summary,
					buySummary: testProduct.buy_summary,
					instasell: testProduct.sell_summary[0].pricePerUnit,
					instabuy: testProduct.buy_summary[0].pricePerUnit
				}
			]);
	
			testProduct.product_id = "New Product ID";
	
			const newResult = await bazaar.fetchProducts();
	
			expect(newResult[0]).toBeDefined();
			expect(newResult[0].id).toEqual(oldId);
			expect(newResult[0].id).not.toEqual(testProduct.product_id);

			testProduct.product_id = oldId;
		});
	
		it("Should update if it's been 20 seconds since the last fetch.", async () => {
			const testProduct = mockResponse.data.products.TestItem;
			const bazaar = new Bazaar(mockHypixelApi, mockSkyblockItems, mockLogCategory);
	
			const result = bazaar.fetchProducts();
			const oldId = testProduct.product_id;
			await expect(result).resolves.toEqual([
				{
					id: testProduct.product_id,
					name: "Example Name",
					sellSummary: testProduct.sell_summary,
					buySummary: testProduct.buy_summary,
					instasell: testProduct.sell_summary[0].pricePerUnit,
					instabuy: testProduct.buy_summary[0].pricePerUnit
				}
			]);
	
			testProduct.product_id = "New Product ID";
			bazaar["productListExpiresAt"] = 0; // Emulates 20,000 seconds passing.
	
			const newResult = await bazaar.fetchProducts();
	
			expect(newResult[0]).toBeDefined();
			expect(newResult[0].id).toEqual(testProduct.product_id);
			expect(newResult[0].id).not.toEqual(oldId);

			testProduct.product_id = oldId;
		});
	
	
		it("Should sanity check the cache test", async () => {
			const testProduct = mockResponse.data.products.TestItem;
			testProduct.product_id = "A random ID";
	
			const result = await new Bazaar(mockHypixelApi, mockSkyblockItems, mockLogCategory).fetchProducts();
			expect(result[0]).toBeDefined();
			expect(result[0].id).toEqual("A random ID");
		});
	});
});

const mockResponse = {
	data: {
		success: true,
		lastUpdated: Date.now(),
		products: {
			"TestItem": {
				product_id: "TEST_ID",
				sell_summary: [
					{
						amount: 47587,
						pricePerUnit: 2.7,
						orders: 1
					}
				],
				buy_summary: [
					{
						amount: 13565,
						pricePerUnit: 5.0,
						orders: 1
					}
				],
				quick_status: {
					productId: "TEST_ID",
					sellPrice: 2.6404746719729246,
					sellVolume: 4664774,
					sellMovingWeek: 98096646,
					sellOrders: 78,
					buyPrice: 5.929241715308097,
					buyVolume: 6513753,
					buyMovingWeek: 64359846,
					buyOrders: 435
				}
			}
		}
	}
};
