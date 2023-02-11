import { Client, Events, GatewayIntentBits } from "discord.js";
import { SlashCommandManager } from "../applicationCommands/SlashCommandManager";

class DiscordBot {
  constructor(readonly client: Client<true>, private slashCommands: SlashCommandManager) {
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return
      if (!interaction.inCachedGuild()) return
      await slashCommands.onSlashCommandInteraction(interaction)
    })
  }
}

export async function createDiscordBot(token: string, slashCommands: SlashCommandManager) {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  })
  client.login(token)
  const readyClient: Client<true> = await new Promise((resolve, reject) => {
    client.once(Events.Error, reject),
    client.once(Events.ClientReady, (readyClient) => {
      client.off(Events.Error, reject)
      resolve(readyClient)
    })
  })
  return new DiscordBot(readyClient, slashCommands)
}