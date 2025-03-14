export class LevelCurve {
	readonly levelFunction: LevelFunction
	readonly maxLevel: number

	protected constructor(levelFunction: LevelFunction, maxLevel?: number) {
		this.levelFunction = levelFunction
		this.maxLevel = maxLevel ?? levelFunction.maxLevel
	}

	static fromCumulativeXp(cumulativeXp: number[]) {
		const arrayFunction = ArrayLevelFunction.fromCumulative(cumulativeXp)
		return new LevelCurve(arrayFunction)
	}

	static fromLevelXp(levelXp: number[]) {
		const arrayFunction = ArrayLevelFunction.fromLevel(levelXp)
		return new LevelCurve(arrayFunction)
	}

	static create(levelFunction: LevelFunction): LevelCurve {
		return new LevelCurve(levelFunction)
	}

	withMaxLevel(maxLevel: number): LevelCurve {
		return new LevelCurve(this.levelFunction, maxLevel)
	}

	withMaxXp(maxXp: number): LevelCurve {
		const maxLevel = this.levelFunction.getLevelForTotalXp(maxXp)
		return this.withMaxLevel(maxLevel)
	}

	allowOverflow(): OverflowLevelCurve {
		return new OverflowLevelCurve(this.levelFunction, this.maxLevel)
	}

	at(xp: number, cap?: number): Level {
		if (cap != null && cap > this.maxLevel) {
			throw new Error("Cap cannot be higher than the max level.")
		}
		return new Level(this, xp, cap)
	}
}

export class OverflowLevelCurve extends LevelCurve {
	constructor(levelFunction: LevelFunction, maxLevel?: number) {
		super(levelFunction, maxLevel)
	}

	at(xp: number, cap?: number): OverflowLevel {
		if (cap != null && cap > this.maxLevel) {
			throw new Error("Cap cannot be higher than the max level.")
		}
		return new OverflowLevel(this, xp, cap)
	}
}

export class Level {
	private totalXp: number
	private cap: number | null

	protected curve: LevelCurve
	private unboundedLevel?: number

	constructor(curve: LevelCurve, xp: number, cap?: number) {
		this.curve = curve
		this.totalXp = xp
		this.cap = cap != null && cap != curve.maxLevel ? cap : null
	}

	getUnboundedLevel(): number {
		if (this.unboundedLevel == null) {
			this.unboundedLevel = this.curve.levelFunction.getLevelForTotalXp(this.totalXp)
		}
		return this.unboundedLevel
	}

	getLevel(): number {
		return Math.min(this.getUnboundedLevel(), this.getUserMaxLevel())
	}

	getTotalXp(): number {
		return this.totalXp
	}

	getUserCap(): number | null {
		return this.cap
	}

	getUserMaxLevel(): number {
		return Math.min(this.getMaxLevel(), this.getUserCap() ?? Infinity)
	}

	getMaxLevel(): number {
		return this.curve.maxLevel
	}

	reachedUserMaxLevel() {
		return this.getLevel() == this.getUserMaxLevel()
	}

	reachedUserCap() {
		return this.getLevel() == this.getUserCap()
	}

	getXpToNextLevel(): number | null {
		const levelXp = this.getLevelXp()
		if (levelXp == null) return null
		return Math.max(levelXp - this.getCurrentXp(), 0)
	}

	getCurrentXp(): number {
		return this.getTotalXp() - this.curve.levelFunction.getTotalXpForLevel(this.getLevel())
	}

	getLevelXp(): number | null {
		if (this.getLevel() >= this.getMaxLevel()) {
			return null
		}
		const nextXp = this.curve.levelFunction.getTotalXpForLevel(this.getLevel() + 1)
		const previousXp = this.curve.levelFunction.getTotalXpForLevel(this.getLevel())
		return nextXp - previousXp
	}

	getFractionalLevel() {
		if (this.reachedUserMaxLevel()) {
			return this.getLevel()
		}
		const fraction = this.getCurrentXp() / (this.getLevelXp() ?? Infinity)
		return this.getLevel() + Math.min(fraction, 1)
	}
}

export class OverflowLevel extends Level {
	getOverflowLevel() {
		return Math.min(this.getUnboundedLevel(), this.getUserCap() ?? Infinity)
	}

	getOverflowMaxLevel() {
		return this.curve.levelFunction.maxLevel
	}

	getOverflowUserMaxLevel() {
		return Math.min(this.getOverflowMaxLevel(), this.getUserCap() ?? Infinity)
	}

	getOverflowXpToNextLevel(): number | null {
		const levelXp = this.getOverflowLevelXp()
		if (levelXp == null) return null
		return Math.max(levelXp - this.getOverflowCurrentXp(), 0)
	}

	getOverflowCurrentXp(): number {
		return this.getTotalXp() - this.curve.levelFunction.getTotalXpForLevel(this.getOverflowLevel())
	}

	getOverflowLevelXp(): number | null {
		if (this.getOverflowLevel() >= this.getOverflowMaxLevel()) {
			return null
		}
		const nextXp = this.curve.levelFunction.getTotalXpForLevel(this.getOverflowLevel() + 1)
		const previousXp = this.curve.levelFunction.getTotalXpForLevel(this.getOverflowLevel())
		return nextXp - previousXp
	}

	getOverflowFractionalLevel() {
		if (this.reachedUserCap()) {
			return this.getLevel()
		}
		const fraction = this.getOverflowCurrentXp() / (this.getOverflowLevelXp() ?? Infinity)
		return this.getOverflowLevel() + Math.min(fraction, 1)
	}
}

abstract class LevelFunction {
	abstract getTotalXpForLevel(level: number): number

	abstract readonly maxLevel: number

	getLevelForTotalXp(totalXp: number) {
		for (let level = 1; level <= this.maxLevel; level++) {
			const requiredXp = this.getTotalXpForLevel(level)
			if (requiredXp > totalXp) {
				return level - 1
			}
		}
		return this.maxLevel
	}
}

export class ArrayLevelFunction extends LevelFunction {
	private cumulativeXp: number[]

	private constructor(cumulativeXp: number[]) {
		super()
		this.cumulativeXp = cumulativeXp
	}

	static fromCumulative(cumulativeXp: number[]): ArrayLevelFunction {
		return new ArrayLevelFunction(cumulativeXp)
	}

	static fromLevel(levelXp: number[]): ArrayLevelFunction {
		const cumulative: number[] = []
		let total = 0
		for (const xp of levelXp) {
			total += xp
			cumulative.push(total)
		}
		return ArrayLevelFunction.fromCumulative(cumulative)
	}

	getTotalXpForLevel(level: number): number {
		if (level < 0 || level > this.maxLevel) {
			throw new Error(`Level out of bounds: ${level}.`)
		}
		return level != 0 ? this.cumulativeXp[level - 1] : 0
	}

	get maxLevel(): number {
		return this.cumulativeXp.length
	}
}

export class GeneratorLevelFunction extends LevelFunction {
	private cachedXp: number[]
	private generator: Generator<number, never, never>

	constructor(generator: Generator<number, never, never>) {
		super()
		this.cachedXp = []
		this.generator = generator
	}

	getTotalXpForLevel(level: number) {
		if (level < 0) {
			throw new Error(`Level out of bounds: ${level}`)
		}
		while (level > this.cachedXp.length) {
			this.cachedXp.push(this.generator.next().value)
		}
		return level != 0 ? this.cachedXp[level - 1] : 0
	}

	get maxLevel() {
		return Infinity
	}
}
