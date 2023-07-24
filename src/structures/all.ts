import { Client, GuildMember as DiscordGuildMember, Guild as DiscordGuild } from "discord.js";
import { PlayerService } from "../services/PlayerRepository";

class Guild {
  hypixelId: string
  discord: DiscordGuild
  client: Client
}


class DiscordUser {

  private constructor(
    private discord: DiscordGuildMember, 
    private guild: Guild) {}

  static async create(discordId: string, guild: Guild) {
    const discordMember = await guild.discord.members.fetch(discordId)
    const minecraftMember = await PlayerService.findByDiscord(discordId)
    return new DiscordUser(member, guild)
  } 


}