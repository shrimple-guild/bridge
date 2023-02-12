import { MinecraftBot } from "../MinecraftBot";

export interface Pattern {
  name: string,
  pattern: RegExp | RegExp[],
  execute: (bot: MinecraftBot, groups: {[key: string]: string}) => void
}