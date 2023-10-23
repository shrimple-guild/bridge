import { Pattern } from "./Pattern"
import { config } from "../../utils/config.js"
import { MinecraftBot } from "../MinecraftBot";
import fs from "fs"
import { sleep } from "../../utils/utils.js";

export const privateMessage: Pattern = {
  name: "privateMessage",
  pattern: /^From (?:\[(?<hypixelRank>[\w+]+)\] )?(?<name>\w{2,16}): (?<content>.+$)/,
  execute: async (bot, groups) => {
    if (bot.isPrivileged(groups.name)) {
      if (groups.content.startsWith("_config")) {
        const args = groups.content.split(" ")
        await changeConfig(bot, groups.name, args[1], args[2])
      } else {
        bot.chat(groups.content)
        await bot.sendToBridge(bot.username, groups.content, "BOT")
      }
    }
  }
}

async function changeConfig(bot: MinecraftBot, sender: string, path: string, newProperty: string | undefined) {
  const keys = path.split("/")
  let current = config as any
  for (let i = 0; i < keys.length; i++) {
    if (i === keys.length - 1) {
      if (newProperty === undefined) {
        const msgPrefix = `/msg ${sender} `
        const random = ` <@${Math.random().toString(36).substring(2)}>`
        const msg = `${keys[i]}: ${JSON.stringify(current[keys[i]])}`
        if (msg.length < 256 - (msgPrefix.length + random.length)) await bot.chatRaw(msgPrefix + msg + random)
        else {
          let regex = new RegExp(`.{1,${200 - (msgPrefix.length + random.length)}}`, "g")
          const split = msg.match(regex)
          if (split) {
            for (const chunk of split) {
              await bot.chatRaw(msgPrefix + chunk + random)
              await sleep(1000)
            }
          }
        }
      } else {
        let property = newProperty
        try {
          property = JSON.parse(newProperty)
        } catch (e) {
        }
        current[keys[i]] = property
        await bot.chatRaw(`/msg ${sender} Changed ${keys[i]} to ${newProperty} <@${Math.random().toString(36).substring(2)}>`)
        fs.writeFile("./src/config.json", JSON.stringify(config, null, 2), (err) => {
          if (err) {
            console.error(err)
          }
        })
      }
    } else {
      current = current[keys[i]]
    }
  }
}