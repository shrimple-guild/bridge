import discord, {
  ChannelType,
  GatewayIntentBits,
  TextChannel,
  Message,
  EmbedBuilder,
} from "discord.js"
import { bridge } from "../bridge.js"
import { imageLinkRegex as imageLinkPattern } from "../utils/RegularExpressions.js"
import { cleanContent, colorOf } from "../utils/Utils.js"
import { MinecraftEmbed } from "./MinecraftEmbed.js"
import log4js from "log4js"

// config importing
import config from "../config.json" assert { type: "json" }
const { token: botToken, channel: guildChannelId } = config.discord
const guildStaffIds = config.roles.filter(role => role.isStaff).map(role => role.discord)


const logger = log4js.getLogger("discord")

const client = new discord.Client({
  intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
  ]
})

client.login(botToken)

function getTextChannel(channelId: string): TextChannel | undefined {
  const channel = client.channels.cache.get(channelId)
  return (channel?.type == ChannelType.GuildText) ? channel : undefined
}

function getMessage(channelId: string, messageId: string | undefined) {
  if (!messageId) return
  const channel = getTextChannel(channelId)
  return channel ? channel.messages.cache.get(messageId) : undefined
}

function getBridgeAuthorName(message: Message): string {
  const authorName = message.member?.displayName ?? message.author.tag
  if (message?.author.id != client.user?.id) return authorName
  return message.embeds.at(0)?.author?.name ?? authorName
}

async function sendGuildChatEmbed(username: string, content: string, colorValue?: string, guildRank?: string) {
  const channel = getTextChannel(guildChannelId)
  if (!channel) return
  const imageAttachment = content.match(imageLinkPattern)?.at(0)
  const contentWithoutImage = content.replace(imageLinkPattern, "")
  const embed = (await new MinecraftEmbed().setMinecraftAuthor(username))
    .setDescription((contentWithoutImage.length > 0) ? contentWithoutImage : null)
    .setColor(colorOf(colorValue))
    .setFooter(guildRank ? { text: guildRank } : null)
    .setTimestamp(Date.now())
  if (imageAttachment) embed.setImage(imageAttachment)
  embed.send(channel)
}

async function sendSimpleEmbed(title: string, content: string, footer?: string) {
  const channel = getTextChannel(guildChannelId)
  if (!channel) return

  const embed = new EmbedBuilder()
    .setColor(colorOf("BOT"))
    .setTitle(title)
    .setDescription(content)
    .setFooter(footer ? { text: footer } : null)
    .setTimestamp(Date.now())

  channel.send({ embeds: [embed] })
}

client.once("ready", () => {
  logger.info(`Connected.`)
})

client.on("messageCreate", async (message) => {
  if (message.author.bot) return
  if (guildChannelId != message.channelId) return
  const author = getBridgeAuthorName(message)
  const isStaff = guildStaffIds.some(id => message.member?.roles.cache.has(id)) ?? false
  const reply = getMessage(guildChannelId, message.reference?.messageId)
  const replyAuthor = reply ? getBridgeAuthorName(reply) : undefined

  let content = cleanContent(message.cleanContent)

  const attachments = message.attachments.map((attachment) => attachment.url)?.join(" ")
  if (attachments != null) {
    content += ` ${attachments}`
  }
  const stickers = message.stickers?.map(sticker => `<${sticker.name}>`)?.join(" ")
  if (stickers != null) {
    content += `${stickers}`
  }
  bridge.onDiscordChat(author, content, isStaff, replyAuthor)
})

export const discordBot = {
  sendGuildChatEmbed,
  sendSimpleEmbed
}