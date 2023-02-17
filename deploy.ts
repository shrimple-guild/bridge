
import { REST, Routes } from "discord.js"
import config from "./ambientConfig.json" assert { type: "json" }
import { SlashCommand } from "./discord/commands/SlashCommand.js"
import { ManualVerifyCommand } from "./verify/commands/ManualVerifyCommand.js"
import { UnverifyCommand } from "./verify/commands/UnverifyCommand.js"
import { VerifyCommand } from "./verify/commands/VerifyCommand.js"

const slashCommands = [
  new ManualVerifyCommand(),
  new VerifyCommand(),
  new UnverifyCommand()
]

await loadCommands(slashCommands, config.discord.token, config.discord.client, config.discord.guild)


async function loadCommands(commands: SlashCommand[], token: string, clientId: string, guildId: string) {
  const commandJsonData = commands.map(command => command.data.toJSON())
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