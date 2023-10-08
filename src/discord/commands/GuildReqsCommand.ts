import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { statusEmbed } from "../../utils/discordUtils.js";
import { SlashCommand } from "../../discord/commands/SlashCommand.js";
import { HypixelAPI } from "../../api/HypixelAPI.js";
import { getGuildRank, getGuildRequirementResults } from "../GuildReqs.js";
import { EmbedBuilder } from "@discordjs/builders";
import { formatNumber, titleCase } from "../../utils/utils.js";

export class GuildReqsCommand implements SlashCommand {
	data = new SlashCommandBuilder()
		.setName("guildrequirements")
		.setDescription("Check whether you meet guild requirements.")
		.addStringOption((option) =>
			option
				.setRequired(true)
				.setName("username")
				.setDescription("The Minecraft username of the user")
		);

	constructor(private hypixelAPI?: HypixelAPI) {}

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		try {
			await interaction.deferReply();
			if (!this.hypixelAPI)
				throw new Error("Improper configuration! Please report this to staff.");
			const username = interaction.options.getString("username", true);
			const uuid = await this.hypixelAPI.mojang.fetchUuid(username);
			const profiles = await this.hypixelAPI.fetchProfiles(uuid);
			const guildRequirementResults = await getGuildRequirementResults(
				profiles.main
			);
			const guildRankData = getGuildRank(guildRequirementResults);

			const embed = new EmbedBuilder()
				.setTitle(`Guild requirement check for ${username}`)
				.setDescription(
					`**Meets guild requirements: ** ${boolToCheck(
						guildRankData.canJoin
					)}\n**Guild Rank**: ${guildRankData.rank}
        `
				)
				.addFields(
					{
						name: "Skyblock Level",
						value: guildRequirementResults.skyblockLevel.toString(),
						inline: true
					},
					{
						name: "Overflow Fishing XP",
						value: formatNumber(
							guildRequirementResults.overflowFishingXp,
							2,
							true
						),
						inline: true
					},
					{
						name: "Magma Lord",
						value: `${boolToCheck(
							guildRequirementResults.magmaLord
						)} (Bobbin Time ${guildRequirementResults.bobbinTime})`,
						inline: true
					},
					{
						name: "Hellfire Rod",
						value: boolToCheck(guildRequirementResults.hellfire),
						inline: true
					},
					{
						name: "Trophy Hunter",
						value: titleCase(guildRequirementResults.trophyHunter),
						inline: true
					},
					{
						name: "350 Speed and 100 SCCC",
						value: boolToCheck(guildRequirementResults.statsCheck),
						inline: true
					}
				);

			await interaction.followUp({
				embeds: [embed]
			});
		} catch (e) {
			if (e instanceof Error) {
				await interaction.followUp({
					embeds: [statusEmbed("failure", `${e.stack}`)]
				});
			}
			console.error(e);
		}
	}
}

function boolToCheck(bool: boolean) {
	return bool ? "✅" : "❌";
}
