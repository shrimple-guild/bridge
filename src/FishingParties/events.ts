import assert from "assert"

const EPOCH = 1560275700000

const SKYBLOCK_HOUR = 50 * 1000
const SKYBLOCK_DAY = 24 * SKYBLOCK_HOUR
const SKYBLOCK_MONTH = 31 * SKYBLOCK_DAY
const SKYBLOCK_YEAR = 12 * SKYBLOCK_MONTH

console.log(SKYBLOCK_MONTH)

class SkyblockEvent {
  constructor(
    readonly name: string,
    private start: number,
    private interval: number,
    private duration: number,
    private mayor?: string
  ) {}

  mostRecentStart(time: number): number {
    const elapsed = time - this.start
    const occurrences = Math.floor(elapsed / this.interval)
    return this.start + occurrences * this.interval
  }

  currentOrNextStart(time: number): number {
    const mostRecentEventStart = this.mostRecentStart(time)
    return mostRecentEventStart + (this.isActive(time) ? 0 : this.interval)
  }

  currentOrNextEnd(time: number): number {
    return this.currentOrNextStart(time) + this.duration
  }

  isActive(time: number): boolean {
    const mostRecentEventStart = this.mostRecentStart(time)
    const timeSinceStart = (time - mostRecentEventStart) % this.interval
    return timeSinceStart <= this.duration
  }
}

const marinaEvent = new SkyblockEvent(
  "Fishing Festival", 
  EPOCH, 
  SKYBLOCK_MONTH, 
  3 * SKYBLOCK_DAY, 
  "Marina"
)

const spookyEvent = new SkyblockEvent(
  "Spooky Fishing", 
  EPOCH + 7 * SKYBLOCK_MONTH + 25 * SKYBLOCK_DAY, 
  SKYBLOCK_YEAR, 
  9 * SKYBLOCK_DAY
)

const winterEvent = new SkyblockEvent(
  "Winter Fishing",
  EPOCH + 11 * SKYBLOCK_MONTH,
  SKYBLOCK_YEAR,
  SKYBLOCK_MONTH
)

const events = [marinaEvent, spookyEvent, winterEvent]

assert(marinaEvent.currentOrNextStart(EPOCH) == EPOCH)
assert(marinaEvent.currentOrNextStart(EPOCH + 2 * SKYBLOCK_DAY) == EPOCH)
assert(marinaEvent.currentOrNextStart(EPOCH + 4 * SKYBLOCK_DAY) == EPOCH + SKYBLOCK_MONTH)

