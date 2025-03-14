import { ArrayLevelFunction, GeneratorLevelFunction, LevelCurve } from "../../utils/Level.js"

describe("LevelFunction", () => {
	it("should get levels for total xp", () => {
		const fun = ArrayLevelFunction.fromCumulative([50, 100, 150, 200, 300])
		expect(fun.getLevelForTotalXp(0)).toBe(0)
		expect(fun.getLevelForTotalXp(49)).toBe(0)
		expect(fun.getLevelForTotalXp(50)).toBe(1)
		expect(fun.getLevelForTotalXp(51)).toBe(1)
		expect(fun.getLevelForTotalXp(150)).toBe(3)
		expect(fun.getLevelForTotalXp(300)).toBe(5)
		expect(fun.getLevelForTotalXp(100000000)).toBe(5)
	})
})

describe("ArrayLevelFunction", () => {
	it("should get total xp for levels", () => {
		const fun = ArrayLevelFunction.fromCumulative([50, 100, 150, 200, 300])
		expect(fun.getTotalXpForLevel(0)).toBe(0)
		expect(fun.getTotalXpForLevel(1)).toBe(50)
		expect(fun.getTotalXpForLevel(2)).toBe(100)
		expect(fun.getTotalXpForLevel(3)).toBe(150)
		expect(fun.getTotalXpForLevel(4)).toBe(200)
		expect(fun.getTotalXpForLevel(5)).toBe(300)
		expect(() => fun.getTotalXpForLevel(-1)).toThrow()
		expect(() => fun.getTotalXpForLevel(6)).toThrow()
	})
})

describe("GeneratorLevelFunction", () => {
	function* exponentialGenerator(): Generator<number, never, never> {
		let totalXp = 1

		while (true) {
			yield totalXp
			totalXp *= 2
		}
	}

	it("should get total xp for levels", () => {
		const fun = new GeneratorLevelFunction(exponentialGenerator())
		expect(fun.getTotalXpForLevel(0)).toBe(0)
		expect(fun.getTotalXpForLevel(1)).toBe(1)
		expect(fun.getTotalXpForLevel(3)).toBe(4)
		expect(fun.getTotalXpForLevel(5)).toBe(16)
		expect(fun.getTotalXpForLevel(10)).toBe(512)
		expect(fun.getTotalXpForLevel(6)).toBe(32)
		expect(() => fun.getTotalXpForLevel(-1)).toThrowError()
	})
})

describe("Level", () => {
	it("should resolve correctly for 0 xp", () => {
		const fun = ArrayLevelFunction.fromCumulative([50, 100, 150, 200, 300])
		const curve = LevelCurve.create(fun)
		const level = curve.at(0)

		expect(level.getLevelXp()).toBe(50)
		expect(level.getTotalXp()).toBe(0)
		expect(level.getLevel()).toBe(0)
		expect(level.getUserCap()).toBe(null)
		expect(level.getUserMaxLevel()).toBe(5)
		expect(level.getMaxLevel()).toBe(5)
		expect(level.reachedUserCap()).toBe(false)
		expect(level.getFractionalLevel()).toBe(0)
		expect(level.getXpToNextLevel()).toBe(50)
	})

	it("should resolve correctly at exact level xp", () => {
		const fun = ArrayLevelFunction.fromCumulative([50, 100, 150, 200, 300])
		const curve = LevelCurve.create(fun)
		const level = curve.at(100)

		expect(level.getCurrentXp()).toBe(0)
		expect(level.getLevelXp()).toBe(50)
		expect(level.getTotalXp()).toBe(100)
		expect(level.getLevel()).toBe(2)
		expect(level.reachedUserCap()).toBe(false)
		expect(level.getFractionalLevel()).toBe(2)
		expect(level.getXpToNextLevel()).toBe(50)
	})

	it("should resolve correctly at middle of level", () => {
		const fun = ArrayLevelFunction.fromCumulative([50, 100, 150, 200, 300])
		const curve = LevelCurve.create(fun)
		const level = curve.at(225)

		expect(level.getCurrentXp()).toBe(25)
		expect(level.getLevelXp()).toBe(100)
		expect(level.getTotalXp()).toBe(225)
		expect(level.getLevel()).toBe(4)
		expect(level.reachedUserCap()).toBe(false)
		expect(level.getFractionalLevel()).toBe(4.25)
		expect(level.getXpToNextLevel()).toBe(75)
	})

	it("should resolve correctly at highest level", () => {
		const fun = ArrayLevelFunction.fromCumulative([50, 100, 150, 200, 300])
		const curve = LevelCurve.create(fun)
		const level = curve.at(350)

		expect(level.getCurrentXp()).toBe(50)
		expect(level.getLevelXp()).toBe(null)
		expect(level.getTotalXp()).toBe(350)
		expect(level.getLevel()).toBe(5)
		expect(level.reachedUserCap()).toBe(false)
		expect(level.getFractionalLevel()).toBe(5)
		expect(level.getXpToNextLevel()).toBe(null)
	})

	it("should resolve correctly with cap", () => {
		const fun = ArrayLevelFunction.fromCumulative([50, 100, 150, 200, 300])
		const curve = LevelCurve.create(fun)
		const level = curve.at(350, 3)

		expect(level.getLevel()).toBe(3)
		expect(level.getCurrentXp()).toBe(200)
		expect(level.getLevelXp()).toBe(50)
		expect(level.getTotalXp()).toBe(350)
		expect(level.reachedUserCap()).toBe(true)
		expect(level.getFractionalLevel()).toBe(3)
		expect(level.getXpToNextLevel()).toBe(0)
	})

	it("should resolve correctly with overflow", () => {
		const fun = ArrayLevelFunction.fromCumulative([
			50, 100, 150, 200, 300, 500, 1000, 2000, 4000, 10000
		])
		const curve = LevelCurve.create(fun).withMaxLevel(5).allowOverflow()
		const level = curve.at(7000)

		expect(level.getLevel()).toBe(5)
		expect(level.getOverflowLevel()).toBe(9)
		expect(level.getOverflowCurrentXp()).toBe(3000)
		expect(level.getOverflowLevelXp()).toBe(6000)
		expect(level.getOverflowFractionalLevel()).toBe(9.5)
		expect(level.getOverflowXpToNextLevel()).toBe(3000)
	})

	it("should resolve correctly with overflow but at user cap", () => {
		const fun = ArrayLevelFunction.fromCumulative([
			50, 100, 150, 200, 300, 500, 1000, 2000, 4000, 10000
		])
		const curve = LevelCurve.create(fun).withMaxLevel(5).allowOverflow()
		const level = curve.at(7000, 4)

		expect(level.getLevel()).toBe(4)
		expect(level.getOverflowLevel()).toBe(4)
		expect(level.getOverflowCurrentXp()).toBe(6800)
		expect(level.getOverflowLevelXp()).toBe(100)
		expect(level.getOverflowFractionalLevel()).toBe(4)
		expect(level.getOverflowXpToNextLevel()).toBe(0)
	})

	it("should resolve correctly with overflow past max level", () => {
		const fun = ArrayLevelFunction.fromCumulative([
			50, 100, 150, 200, 300, 500, 1000, 2000, 4000, 10000
		])
		const curve = LevelCurve.create(fun).withMaxLevel(5).allowOverflow()
		const level = curve.at(15000)

		expect(level.getLevel()).toBe(5)
		expect(level.getOverflowLevel()).toBe(10)
		expect(level.getOverflowCurrentXp()).toBe(5000)
		expect(level.getOverflowLevelXp()).toBe(null)
		expect(level.getOverflowFractionalLevel()).toBe(10)
		expect(level.getOverflowXpToNextLevel()).toBe(null)
	})
})
