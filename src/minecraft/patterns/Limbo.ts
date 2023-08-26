import { Pattern } from "./Pattern"

export const limbo: Pattern = {
  name: "limbo",
  pattern: /^You were spawned in Limbo.$/,
  execute: async bot => await bot.setOnline()
}