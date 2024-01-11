import { EmbedBuilder } from "@discordjs/builders";
import { ChannelType, Client, Events, GatewayIntentBits, GuildMember, Message, TextChannel } from "discord.js";
import { SlashCommandManager } from "./commands/SlashCommandManager.js";
import { Bridge } from "../bridge/Bridge.js";
import { simpleEmbed } from "../utils/discordUtils.js";
import { LoggerCategory } from "../utils/Logger.js";
import { imageLinkRegex } from "../utils/RegularExpressions.js";
import { colorOf, cleanContent } from "../utils/utils.js";
import { HypixelAPI } from "../api/HypixelAPI.js";
import { config } from "../utils/config.js";

export class DiscordBot {
  bridge?: Bridge

  constructor(
    readonly client: Client<true>,
    private slashCommands: SlashCommandManager,
    private guildBridgeChannelId: string,
    private hypixelAPI: HypixelAPI,
    private logger?: LoggerCategory
  ) {
    logger?.info(`Discord bot online.`)

    this.client.on("error", (error) => {
      logger?.error("Error talking to the Discord API...", error)
    })

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return
      logger?.info(`Slash command used: ${interaction.commandName}`)
      await this.slashCommands.onSlashCommandInteraction(interaction)
    })

    this.client.on(Events.MessageCreate, async (message) => {
      if (!this.bridge || !message.inGuild() || message.author.bot) return
      if (this.guildBridgeChannelId != message.channelId) return
      const author = message.member
      if (!author) return
      const authorName = message.member.displayName
      const reply = await message.fetchReference().catch(e => undefined)
      const replyAuthor = reply ? this.getAuthorName(reply) : undefined

      let content = cleanContent(message.cleanContent)

      const attachments = message.attachments.map((attachment) => attachment.url)?.join(" ")
      if (attachments != null) {
        content += ` ${attachments}`
      }
      const stickers = message.stickers?.map(sticker => `<${sticker.name}>`)?.join(" ")
      if (stickers != null) {
        content += `${stickers}`
      }

      logger?.info(`Discord chat: ${authorName} to ${replyAuthor}: ${content}`)
      await this.bridge.onDiscordChat(authorName, content, this.isStaff(author), replyAuthor)
    })
  }

  private isStaff(member: GuildMember) {
    return config.roles
      .filter((role) => role.isStaff)
      .map((role) => role.discord)
      .some(id => member.roles.cache.has(id)) ?? false
  }

  async sendGuildChatEmbed(username: string, content: string, colorValue?: string, guildRank?: string) {
    const channel = this.getTextChannel(this.guildBridgeChannelId)
    if (!channel) return
    const imageAttachment = content.match(imageLinkRegex)?.at(0)
    const contentWithoutImage = content.replace(imageLinkRegex, "")
    const embed = await this.setMinecraftAuthor(username)
    embed
      .setDescription((contentWithoutImage.length > 0) ? contentWithoutImage : null)
      .setColor(colorOf(colorValue))
      .setFooter(guildRank ? { text: guildRank } : null)
      .setTimestamp(Date.now())
    if (imageAttachment) embed.setImage(imageAttachment)
    await channel.send({ embeds: [embed] }).catch(e => this.logger?.error("Failed to send embed", e))
  }

  async sendSimpleEmbed(title: string, content: string, footer?: string) {
    const channel = this.getTextChannel(this.guildBridgeChannelId)
    if (!channel) return
    const embed = simpleEmbed(title, content, footer)
    await channel.send({ embeds: [embed] }).catch(e => this.logger?.error("Failed to send embed", e))
  }

  private getTextChannel(channelId: string): TextChannel | undefined {
    const channel = this.client.channels.cache.get(channelId)
    return (channel?.type == ChannelType.GuildText) ? channel : undefined
  }

  private getAuthorName(message: Message<true>): string {
    const messageAuthor = message.member?.displayName ?? message.author.tag
    if (message.author.id != this.client.user?.id) return messageAuthor
    return message.embeds.at(0)?.author?.name ?? messageAuthor
  }

  private async setMinecraftAuthor(username: string): Promise<EmbedBuilder> {
    return new EmbedBuilder().setAuthor({ name: username, iconURL: await this.hypixelAPI.mojang.fetchSkin(username) })
  }
}

export async function createDiscordBot(
  token: string,
  slashCommands: SlashCommandManager,
  guildBridgeChannelId: string,
  hypixelAPI: HypixelAPI,
  logger?: LoggerCategory
) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  })
  await client.login(token)
  const readyClient: Client<true> = await new Promise((resolve, reject) => {
    client.once(Events.Error, reject),
      client.once(Events.ClientReady, (readyClient) => {
        client.off(Events.Error, reject)
        resolve(readyClient)
      })
  })
  return new DiscordBot(readyClient, slashCommands, guildBridgeChannelId, hypixelAPI, logger)
}
