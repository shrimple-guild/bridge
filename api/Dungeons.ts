import { Level } from "./Level.js"

const floors = [0, 1, 2, 3, 4, 5, 6, 7]

const dungeonClasses = [
  "healer",
  "archer",
  "tank",
  "mage",
  "berserk"
] as const

type DungeonClass = typeof dungeonClasses[number]

export function isDungeonClass(str: string): str is DungeonClass {
  return dungeonClasses.includes(str as DungeonClass)
}

export class Dungeons {
  readonly level: Level
  readonly classes: {
    readonly healer: Level,
    readonly archer: Level,
    readonly tank: Level,
    readonly mage: Level,
    readonly berserk: Level,
  }
  private catacombs: {
    readonly normal: (FloorData | undefined)[],
    readonly master: (FloorData | undefined)[]
  }

  constructor(member: any) {
    const dungeons = member.dungeons
    this.level = new Level("dungeons", dungeons.dungeon_types.catacombs.experience)
    this.classes = {
      healer: new Level("dungeons", dungeons.player_classes.healer?.experience ?? 0),
      archer: new Level("dungeons", dungeons.player_classes.archer?.experience ?? 0),
      tank: new Level("dungeons", dungeons.player_classes.tank?.experience ?? 0),
      mage: new Level("dungeons", dungeons.player_classes.mage?.experience ?? 0),
      berserk: new Level("dungeons", dungeons.player_classes.berserk?.experience ?? 0)
    }
    this.catacombs = {
      normal: floors.map(floor => buildFloorData(dungeons.dungeon_types.catacombs, floor)),
      master: floors.map(floor => buildFloorData(dungeons.dungeon_types.master_catacombs, floor))
    }
  }

  floor(mode: "normal" | "master", floor: number) {
    return this.catacombs[mode][floor]
  }

  collection(floor: number) {
    const normalCompletions = this.catacombs["normal"][floor]?.completions ?? 0
    const masterCompletions = this.catacombs["master"][floor]?.completions ?? 0
    return normalCompletions + masterCompletions
  }

}

export type FloorData = {
  completions: number,
  pb?: number,
  sPb?: number,
  sPlusPb?: number
}

function buildFloorData(data: any, floor: number): FloorData | undefined {
  return {
    completions: data?.tier_completions?.[floor] ?? 0,
    pb: data?.fastest_time?.[floor],
    sPb: data?.fastest_time_s?.[floor],
    sPlusPb: data?.fastest_time_s_plus?.[floor]
  }
}


