import { MinecraftBot } from "../MinecraftBot";

export interface Pattern {
  name: string,
  pattern: RegExp | RegExp[],
  raw?: boolean,
  execute: (bot: MinecraftBot, groups: {[key: string]: string}, globalGroups: {[key: string]: string}[]) => Promise<void>
}