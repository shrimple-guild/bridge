import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "./SlashCommand.js";

export class SlashCommandManager {
    commands: SlashCommand[] = []

    register(...commands: SlashCommand[]) {
      this.commands.push(...commands)
    }

    async onSlashCommandInteraction(interaction: ChatInputCommandInteraction<"cached">) {
      const command = this.commands.find(command => command.data.name === interaction.commandName)
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return
      }
      try {
        await command.execute(interaction)
      } catch (error) {
        // catch earlier if you want response: unknown whether you've already replied at this point
        console.error(error);
      }
    }
}