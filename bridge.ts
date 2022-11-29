import EventEmitter from "events"
import TypedEmitter from "typed-emitter"
import { BridgeEvents } from "./events/BridgeEvents"
import log4js from "log4js"
import { MinecraftBot } from "./minecraft/MinecraftBot.js"
import readline from "readline"

export const bridgeEmitter = new EventEmitter() as TypedEmitter<BridgeEvents>
log4js.configure({
  appenders: {
    out: { type: "stdout" },
  },
  categories: {
    bridge: { appenders: ["out"], level: "debug" },
    minecraft: { appenders: ["out"], level: "debug" },
    discord: { appenders: ["out"], level: "debug" }
  },
})

const minecraft = new MinecraftBot("Fishre")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on("line", (input) => {
  if (input != "quit") {
    minecraft.chat(input)
  } else {
    minecraft.disconnect()
  }
})

