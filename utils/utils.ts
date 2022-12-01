import emojiRegex from "emoji-regex"
import { emojiToName } from "gemoji"
let emojiPattern = emojiRegex()

export function sleep<T>(ms: number, onCompletion?: T): Promise<T> {
  return new Promise<T>(resolve => {
    setTimeout(resolve, ms)
    return onCompletion
  })
}

export function colorOf(hypixelRank: string | undefined): [red: number, green: number, blue: number] {
  switch (hypixelRank) {
    case undefined:
      return [170, 170, 170]
    case "VIP":
    case "VIP+":
      return [85, 255, 85]
    case "MVP":
    case "MVP+":
      return [85, 255, 255]
    case "MVP++":
      return [255, 170, 0]
    default:
      return [85, 85, 255]
  }
}

export function cleanContent(content: string) {
  return content
    .replaceAll(emojiPattern, substring => ` :${emojiToName[substring.replace(/[\u{1F3FB}-\u{1F3FF}]/ug, '')] ?? "unknown_emoji"}: `)
    .replace(/\s+/g, " ")
    .replace(/<(?:a)?(:\w{2,}:)\d{17,19}>/g, "$1")
    .replaceAll("ez", "e\u{200D}z")
    .trim()
    .slice(0, 256)
}