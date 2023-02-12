import { ChatInputCommandInteraction, Client, Events, REST, Routes, SlashCommandBuilder } from "discord.js";
import { HypixelAPI } from "../api/HypixelAPI.js";
import { Verification } from "../features/verify/Verification.js";
import { ManualVerifyCommand } from "../features/verify/commands/ManualVerifyCommand.js";
import { SlashCommand } from "./SlashCommand.js";
import { VerifyCommand } from "../features/verify/commands/VerifyCommand.js";

export class SlashCommandManager {
    commands: SlashCommand[]
    
    constructor(verification?: Verification, hypixelAPI?: HypixelAPI) {
      this.commands = [
        new VerifyCommand(verification, hypixelAPI),
        new ManualVerifyCommand(verification, hypixelAPI)
      ]
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

    async loadCommands(token: string, clientId: string, guildId: string) {
      const commandJsonData = this.commands.map(command => command.data.toJSON())
      const rest = new REST({ version: '10' }).setToken(token)
      try {
        console.log(`Started refreshing ${commandJsonData.length} application (/) commands.`)
        const data = await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: commandJsonData },
        )
        console.log(`Successfully reloaded ${(data as any).length} application (/) commands.`)
      } catch (error) {
        console.error(error)
      }
    }
}