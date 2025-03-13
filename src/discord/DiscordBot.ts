import { EmbedBuilder } from "@discordjs/builders"
import {
	ChannelType,
	Client,
	Events,
	GatewayIntentBits,
	GuildMember,
	Message,
	TextChannel
} from "discord.js"
import { SlashCommandManager } from "./commands/SlashCommandManager.js"
import { Bridge } from "../bridge/Bridge.js"
import { simpleEmbed } from "../utils/discordUtils.js"
import { LoggerCategory } from "../utils/Logger.js"
import { imageLinkRegex } from "../utils/RegularExpressions.js"
import { colorOf, cleanContent } from "../utils/utils.js"
import { HypixelAPI } from "../api/HypixelAPI.js"
import { config } from "../utils/config.js"
//@ts-ignore
import { STuF } from "stuf"
import { InteractionRegistry } from "./interactions/InteractionRegistry.js"

export class DiscordBot {
	private urlRegex = /(?:https?:\/\/|www\.)[^\s\/$.?#].[^\s]*/g

	bridge?: Bridge

	constructor(
		readonly client: Client<true>,
		private slashCommands: SlashCommandManager,
		private interactions: InteractionRegistry,
		private hypixelAPI: HypixelAPI,
		private logger?: LoggerCategory
	) {
		logger?.info(`Discord bot online.`)

		this.client.on("error", (error) => {
			logger?.error("Error talking to the Discord API...", error)
		})

		this.client.on(Events.InteractionCreate, async (interaction) => {
			if (!interaction.inCachedGuild()) return

			if (interaction.isChatInputCommand()) {
				logger?.info(`Slash command used: ${interaction.commandName}`)
				await this.slashCommands.onSlashCommandInteraction(interaction)
			} else if (interaction.isModalSubmit() || interaction.isMessageComponent()) {
				logger?.info(`Interaction used: ${interaction.customId}`)
				await this.interactions.onInteraction(interaction)
			}
		})

		this.client.on(Events.MessageCreate, async (message) => {
			if (!this.bridge || !message.inGuild() || message.author.bot) return
			if (this.bridge.getDiscordChannelId() != message.channelId) return
			let authorName
			const author = message.member
			if (!author) return

			authorName = cleanContent(author.displayName ?? author.user.username ?? author.user.tag)
			if (!authorName) {
				authorName = cleanContent(
					message.author.displayName ?? message.author.username ?? message.author.tag
				)
			}

			if (!authorName) return

			const reply = await message.fetchReference().catch((e) => undefined)
			const replyAuthor = reply ? cleanContent(this.getAuthorName(reply), true) : undefined

			let content = cleanContent(message.cleanContent).replace(
				this.urlRegex,
				(url) => `[LINK](${STuF.encode(url)})`
			)

			const attachments = message.attachments
				.map((attachment) => `[LINK](${STuF.encode(attachment.url)})`)
				?.join(" ")
			if (attachments) {
				content += ` ${attachments}`
			}

			const stickers = message.stickers?.map((sticker) => `<${sticker.name}>`)?.join(" ")
			if (stickers) {
				content += `${stickers.trim()}`
			}

			logger?.info(
				`Discord chat: ${authorName}${replyAuthor ? ` to ${replyAuthor}` : ""}: ${content}`
			)
			await this.bridge.onDiscordChat(authorName, content, this.isStaff(author), replyAuthor)
		})
	}

	private isStaff(member: GuildMember) {
		return (
			config.roles
				.filter((role) => role.isStaff)
				.map((role) => role.discord)
				.some((id) => member.roles.cache.has(id)) ?? false
		)
	}

	async sendGuildChatEmbed(
		username: string,
		content: string,
		colorValue?: string,
		guildRank?: string
	) {
		const channel = this.getGuildBridgeChannel()
		if (!channel) return
		const imageAttachment = content.match(imageLinkRegex)?.at(0)
		const contentWithoutImage = content.replace(imageLinkRegex, "")
		const embed = await this.setMinecraftAuthor(username)
		embed
			.setDescription(contentWithoutImage.length > 0 ? contentWithoutImage : null)
			.setColor(colorOf(colorValue))
			.setFooter(guildRank ? { text: guildRank } : null)
			.setTimestamp(Date.now())
		if (imageAttachment) embed.setImage(imageAttachment)
		await channel
			.send({ embeds: [embed] })
			.catch((e) => this.logger?.error("Failed to send embed", e))
	}

	async sendSimpleEmbed(title: string, content: string, footer?: string) {
		const channel = this.getGuildBridgeChannel()
		if (!channel) return
		const embed = simpleEmbed(title, content, footer)
		await channel
			.send({ embeds: [embed] })
			.catch((e) => this.logger?.error("Failed to send embed", e))
	}

	private getGuildBridgeChannel(): TextChannel | undefined {
		if (!this.bridge) return undefined
		return this.getTextChannel(this.bridge.getDiscordChannelId())
	}

	private getTextChannel(channelId: string): TextChannel | undefined {
		const channel = this.client.channels.cache.get(channelId)
		return channel?.type == ChannelType.GuildText ? channel : undefined
	}

	private getAuthorName(message: Message<true>): string {
		// if a server has >1000 members, it doesnt know about the offline ones (member in a guild) so you need to use author (discord user)
		const messageAuthor =
			message.member?.displayName ?? message.author.displayName ?? message.author.tag
		if (message.author.id != this.client.user?.id) return messageAuthor
		return message.embeds.at(0)?.author?.name ?? messageAuthor
	}

	private async setMinecraftAuthor(username: string): Promise<EmbedBuilder> {
		return new EmbedBuilder().setAuthor({
			name: username,
			iconURL: await this.hypixelAPI.mojang.fetchSkin(username)
		})
	}
}

export async function createDiscordBot(
	token: string,
	slashCommands: SlashCommandManager,
	interactions: InteractionRegistry,
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
	return new DiscordBot(readyClient, slashCommands, interactions, hypixelAPI, logger)
}
