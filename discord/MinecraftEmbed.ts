import { EmbedBuilder } from "@discordjs/builders";
import { AttachmentBuilder, TextChannel } from "discord.js";
import { getSkin } from "../utils/skinUtils.js";

export class MinecraftEmbed extends EmbedBuilder {
  files: AttachmentBuilder[]

  constructor() {
    super()
    this.files = []
  }

  async setMinecraftAuthor(username: string): Promise<MinecraftEmbed> {
    this.setAuthor({ name: username, iconURL: "attachment://skin.png" })
    this.files.push(new AttachmentBuilder(await getSkin(username), { name: "skin.png" }))
    return this
  }

  send(channel: TextChannel) {
    channel.send({ embeds: [this], files: this.files })
  }
}