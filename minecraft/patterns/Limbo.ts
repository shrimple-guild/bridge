import { Pattern } from "./Pattern"

export const limbo: Pattern = {
  name: "limbo",
  pattern: /^You were spawned in Limbo.$/,
  execute: bot => bot.setOnline()
}