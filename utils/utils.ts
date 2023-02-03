import dotenv from "dotenv"
dotenv.config()

import emojiRegex from "emoji-regex"
import { emojiToName } from "gemoji"
import { jaro } from "jaro-winkler-typescript"
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

const colorMap: {[color: string]: [red: number, green: number, blue: number]} = {
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
  return colorMap[hypixelRank ?? "DEFAULT"]
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

export function randRange(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.max(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// taken from https://github.com/mat9369/skyblock-rain-timer/blob/main/index.html
export function secsToTime(num: number) {
  var hours: string | number = Math.floor(num / 3600)
  var minutes: string | number = Math.floor((num - (hours * 3600)) / 60)
  var seconds: string | number = num - (hours * 3600) - (minutes * 60)
  if (hours < 10) hours = "0" + hours
  if (minutes < 10) minutes = "0" + minutes
  if (seconds < 10) seconds = "0" + seconds
  return hours + ':' + minutes + ':' + seconds
}

export function titleCase(string: string) {
  return string.toLowerCase().replaceAll("_", " ").replace(/\b([a-z])/g, letter => letter.toUpperCase())
}

export function jaroDistance(string1: string, string2: string) {
  return jaro(string1, string2, { caseSensitive: false })
}

// all values from .env as constants
export const guildRanks = process.env.GUILD_RANKS!.split(",")           // comma seperated string in .env
export const staffRanks = process.env.STAFF_RANKS!.split(",")           // comma seperated string in .env
export const privilegedUsers = process.env.PRIVILEGED_USERS!.split(",") // comma seperated string in .env
export const botUsername = process.env.MC_USERNAME!
export const botToken = process.env.DISCORD_TOKEN!
export const guildId = process.env.GUILD_ID!
export const guildChannelId = process.env.GUILD_CHANNEL_ID!
export const guildStaffId = process.env.GUILD_STAFF_ID!
export const botPrefix = process.env.PREFIX!
export const apiKey = process.env.API_KEY!