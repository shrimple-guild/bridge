import { ColorResolvable, EmbedBuilder } from "discord.js";
import { colorOf } from "./utils.js";

export function simpleEmbed(title: string, content: string, footer?: string, color?: ColorResolvable) {
  return new EmbedBuilder()
    .setColor(color ?? colorOf("BOT"))
    .setTitle(title)
    .setDescription(content)
    .setFooter(footer ? { text: footer } : null)
    .setTimestamp(Date.now())
}

export function statusEmbed(status: "success" | "failure", content: string) {
  return simpleEmbed(
    status == "success" ? "Success" : "Failure", 
    `${(status == "success" ? "✅" : "❌")} ${content}`,
    undefined,
    status == "success" ? "Green" : "Red"
  )
}


