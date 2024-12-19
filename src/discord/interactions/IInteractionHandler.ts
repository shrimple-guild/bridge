import { Interaction } from "discord.js";

export interface IInteractionHandler<T extends Interaction> {
  getCustomId(): string
  handle(interaction: T): Promise<void>;
}