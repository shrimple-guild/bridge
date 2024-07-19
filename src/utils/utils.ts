import { Collection } from "discord.js"
import emojiRegex from "emoji-regex"
import { emojiToName } from "gemoji"
import { jaro } from "jaro-winkler-typescript"
import { deromanize as deromanization } from "romans"

let emojiPattern = emojiRegex()

export function formatNumber(num: number, decimals: number, abbreviate: boolean) {
  const formatter = Intl.NumberFormat("us-EN", {
    maximumFractionDigits: decimals,
    notation: abbreviate ? "compact" : "standard"
  })
  return formatter.format(num)
}

export function sleep<T>(ms: number, onCompletion?: T): Promise<T> {
  return new Promise<T>(resolve => {
    setTimeout(resolve, ms)
    return onCompletion
  })
}

const colorMap: { [color: string]: [red: number, green: number, blue: number] } = {
  "VIP": [85, 255, 85],
  "VIP+": [85, 255, 85],
  "MVP": [85, 255, 255],
  "MVP+": [85, 255, 255],
  "MVP++": [255, 170, 0],
  "BOT": [95, 45, 200],
  "JOINED": [0, 150, 0],
  "LEFT": [150, 0, 0],
  "DEFAULT": [85, 85, 255]
}

export function colorOf(hypixelRank: string | undefined): [red: number, green: number, blue: number] {
  return colorMap[hypixelRank ?? "DEFAULT"]!
}

export function cleanContent(content: string) {
  return content
    .replaceAll(emojiPattern, substring => ` :${emojiToName[substring.replace(/[\u{1F3FB}-\u{1F3FF}]/ug, '')] ?? "unknown_emoji"}: `)
    .replace(/\s+/g, " ")
    .replace(/<(?:a)?(:\w{2,}:)\d{17,19}>/g, "$1")
    .replaceAll(/\bez\b/ig, "éz")
    .trim()
    .slice(0, 256)
}

export function randRange(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.max(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randItem<T>(array: T[]) {
  return array[randRange(0, array.length - 1)]
}

export function msToTime(ms: number | undefined) {
  if (ms == undefined) return undefined
  return secsToTime(ms / 1000)
}

// taken from https://github.com/mat9369/skyblock-rain-timer/blob/main/index.html
export function secsToTime(num: number | undefined) {
  if (num == undefined) return undefined
  let hours: string | number = Math.floor(num / 3600)
  let minutes: string | number = Math.floor((num - (hours * 3600)) / 60)
  let seconds: string | number = num - (hours * 3600) - (minutes * 60)
  if (hours < 10) hours = "0" + hours
  if (minutes < 10) minutes = "0" + minutes
  if (seconds < 10) seconds = "0" + Math.floor(seconds)
  else seconds = Math.floor(seconds)
  return hours + ':' + minutes + ':' + seconds
}

export function titleCase(string: string) {
  return string.toLowerCase().replaceAll("_", " ").replace(/\b([a-z])/g, letter => letter.toUpperCase())
}

export function jaroDistance(string1: string, string2: string) {
  return jaro(string1, string2, { caseSensitive: false })
}

export function deromanize(roman: string) {
  try {
    return deromanization(roman.toUpperCase())
  } catch (e) {
    return roman
  }
}

export function isInteger(num: any): num is number {
  return Number.isInteger(num)
}

export function toCamelCase(str: string) {
  return str.toLowerCase().replace(/[-_][a-z0-9]/g, (group) => group.slice(-1).toUpperCase())
}

export function collectionFrom<T>(data: Record<string, T>): Collection<string, T> {
  return new Collection(Object.entries(data))
}

export function stripColorCodes(str: string) {
  return str.replace(/§[0-9a-fklmnor]/g, "")
}