import { Pattern } from "./Pattern"

export const partyInvite: Pattern = {
  name: "partyInvite",
  pattern: [
    /You have been invited to join (?<name>\w{2,16})'s party!/,
    /(?<name>\w{2,16}) has invited you to join their party!/
  ],
  execute: (bot, groups) => bot.fragbot(groups.name)
  
}