import discord, {
  ChannelType,
  GatewayIntentBits,
  TextChannel,
  Message,
} from "discord.js"
import { bridge } from "../bridge.js"
import { imageLinkRegex as imageLinkPattern } from "../utils/reggies.js"
import { cleanContent, colorOf } from "../utils/utils.js"
import { MinecraftEmbed } from "./FullEmbed.js"
import log4js from "log4js"

const token = process.env.DISCORD_TOKEN!



const guildChannelId = process.env.GUILD_CHANNEL_ID!
const guildStaffId = process.env.GUILD_STAFF_ID!

const logger = log4js.getLogger("discord")

const client = new discord.Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
})

client.login(token)

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

async function sendGuildChatEmbed(username: string, content: string, hypixelRank?: string, guildRank?: string) {
  const channel = getTextChannel(guildChannelId)
  if (!channel) return
  const imageAttachment = content.match(imageLinkPattern)?.at(0)
  const contentWithoutImage = content.replace(imageLinkPattern, "")
  const embed = (await new MinecraftEmbed().setMinecraftAuthor(username))
    .setDescription((contentWithoutImage.length > 0) ? contentWithoutImage : null)
    .setColor(colorOf(hypixelRank))
    .setFooter(guildRank ? {text: guildRank} : null)
    .setTimestamp()
  if (imageAttachment) embed.setImage(imageAttachment)
  if (channel) embed.send(channel)
}

client.once("ready", () => {
  logger.info(`Connected.`)
})

client.on("messageCreate", async (message) => {
  if (message.author.bot) return
  if (guildChannelId != message.channelId) return
  const author = getBridgeAuthorName(message)
  const isStaff = message.member?.roles.cache.has(guildStaffId) ?? false
  const reply = getMessage(guildChannelId, message.reference?.messageId)
  const replyAuthor = reply ? getBridgeAuthorName(reply) : undefined
  const content = cleanContent(message.cleanContent)
  logger.info(`Message: author: "${author}", replying to: "${replyAuthor}", isStaff: ${isStaff}, content: "${content}"`)
  bridge.onDiscordChat(author, content, isStaff, replyAuthor, (status) => {
    logger.info(status)
    message.reply(status == "success" ? "Successfully sent your message :)" : "Failed to send your message :(")
  })
})

export const discordBot = {
  sendGuildChatEmbed
}