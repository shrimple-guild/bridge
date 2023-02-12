import { MinecraftBot } from "../MCBot";

export interface Pattern {
  pattern: RegExp | RegExp[],
  execute: (bot: MinecraftBot, groups: {[key: string]: string}) => void
}