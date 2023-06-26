import { Pattern } from "./Pattern"

export const spamProtection: Pattern = {
  name: "spamProtection",
  pattern: /^You cannot say the same message twice!$/,
  execute: (bot) => bot.onSpamProtection()
}