import { Interaction } from "discord.js";
import { IInteractionHandler } from "./IInteractionHandler";
import { statusEmbed } from "../../utils/discordUtils";

export class InteractionRegistry {
  private handlers: IInteractionHandler<any>[]

  constructor() {
    this.handlers = []
  }

  register(...handlers: IInteractionHandler<any>[]) {
    this.handlers.push(...handlers)
  }

  async onInteraction(interaction: Interaction) {
    if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
      const id = interaction.customId
      const handler = this.handlers.find(handler => handler.getCustomId() == id)
      if (handler == null) return
      try {
        await handler.handle(interaction)
      } catch (e) {
        console.error(e)
        try {
          if (e instanceof Error) {
            await interaction.followUp({ ephemeral: true, embeds: [statusEmbed("failure", `${e.message}`)] })
          }
        } catch (e) {}
      }
      
    }
  }
}