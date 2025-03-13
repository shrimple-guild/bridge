import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { statusEmbed } from "../../utils/discordUtils.js"
import { SlashCommand } from "../../discord/commands/SlashCommand.js"
import { HypixelAPI } from "../../api/HypixelAPI.js"
import { getGuildRank, getGuildRequirementResults } from "../GuildReqs.js"
import { EmbedBuilder } from "@discordjs/builders"
import { formatNumber, titleCase } from "../../utils/utils.js"

export class GuildReqsCommand implements SlashCommand {
	name = "guildrequirements"

	static data = new SlashCommandBuilder()
		.setName("guildrequirements")
		.setDescription("Check whether you meet guild requirements.")
		.addStringOption((option) =>
			option
				.setRequired(true)
				.setName("username")
				.setDescription("The Minecraft username of the user")
		)

	constructor(private hypixelAPI?: HypixelAPI) {}

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		try {
			await interaction.deferReply()
			if (!this.hypixelAPI)
				throw new Error("Improper configuration! Please report this to staff.")
			const username = interaction.options.getString("username", true)
			const uuid = await this.hypixelAPI.mojang.fetchUuid(username)
			const profiles = await this.hypixelAPI.fetchProfiles(uuid)
			const guildRequirementResults = await getGuildRequirementResults(profiles.main)
			const guildRankData = getGuildRank(guildRequirementResults)

			let description: string[] = []

			description.push(
				`This calculator finds whether you meet Shrimple guild reqs! Note: three bobbers are assumed for fishing speed caluclations, and the displayed SCC is the best SCC you can reach with 350 FS. Your Magma Lord **must be in your wardrobe or equipped** to be tracked.`
			)

			description.push("")

			description.push(`**Meets guild requirements: ** ${boolToCheck(guildRankData.canJoin)}`)

			if (guildRankData.canJoin) {
				description.push(`**Guild Rank**: ${guildRankData.rank}`)
			}

			description.push("")

			description.push(`**Breakdown:**`)

			description.push(`Skyblock Level: ${guildRequirementResults.skyblockLevel.toString()}`)
			description.push(
				`Overflow Fishing XP: ${formatNumber(guildRequirementResults.overflowFishingXp, 2, true)}`
			)

			description.push(`Magma Lord Set: ${boolToCheck(guildRequirementResults.magmaLord)}`)
			description.push(`Has Hellfire Rod: ${boolToCheck(guildRequirementResults.hellfire)}`)
			description.push(`Bobbin Time Level: BT ${guildRequirementResults.bobbinTime}`)
			description.push(
				`Trophy Hunter Tier: ${titleCase(guildRequirementResults.trophyHunter)}`
			)
			let statsCheckLine = `350 FS with 100 SCC: ${boolToCheck(guildRequirementResults.statsCheck)}`
			if (guildRequirementResults.statsCheck) {
				statsCheckLine += `(max SCC: ${Math.floor(guildRequirementResults.scc)})`
			}
			description.push(statsCheckLine)

			const embed = new EmbedBuilder()
				.setTitle(`Guild requirement check for ${username}`)
				.setDescription(description.join("\n"))
				.addFields(
					...guildRequirementResults.magmaLordSets.map((set, index) => {
						return {
							name:
								"Magma Lord Set" +
								(guildRequirementResults.magmaLordSets.length > 1
									? ` ${index + 1}`
									: ""),
							value: set
						}
					}),
					{
						name: "Fishing Rods",
						value:
							guildRequirementResults.rods.length != 0
								? guildRequirementResults.rods.join("\n")
								: "No rods found!"
					},
					{
						name: "Pets",
						value:
							guildRequirementResults.petNames.length != 0
								? guildRequirementResults.petNames.join("\n")
								: "No Lvl 100 ammonite or flying fish found!"
					}
				)

			await interaction.followUp({
				embeds: [embed]
			})
		} catch (e) {
			if (e instanceof Error) {
				await interaction.followUp({
					embeds: [statusEmbed("failure", `${stripUserPath(e.stack || "")}`)]
				})
			}
			console.error(e)
		}
	}
}

function stripUserPath(text: string) {
	return text.replaceAll(/.*(src|dist)/g, "")
}

function boolToCheck(bool: boolean) {
	return bool ? "✅" : "❌"
}
