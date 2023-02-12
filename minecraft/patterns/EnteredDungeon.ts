import { Pattern } from "./Pattern"

export const enteredDungeon: Pattern = {
  pattern: /^\[(?<rank>[\w+]+)\] (?<name>\w{2,16}) entered (?<dungeon>.+)$/m,
  execute: bot => bot.clearFragbot()
}