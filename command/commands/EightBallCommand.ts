import { Command } from "./Command.js"
import { randRange } from "../../utils/Utils.js"

export class EightballCommand implements Command {
    aliases = ["8ball", "eightball"]

    usage = "<question>"

    answers = [
        "It is certain.",
        "It is decidedly so.",
        "Without a doubt.",
        "Yes - definitely.",
        "You may rely on it.",
        "As I see it, yes.",
        "Most likely.",
        "Outlook good.",
        "Yes.",
        "Signs point to yes.",
        "Reply hazy, try again.",
        "Ask again later.",
        "Better not tell you now.",
        "Cannot predict now.",
        "Concentrate and ask again.",
        "Don't count on it.",
        "My reply is no.",
        "My sources say no.",
        "Outlook not so good.",
        "Very doubtful."
      ]

    async execute(args: string[]) {
        return this.answers[randRange(0, this.answers.length - 1)]
    }   
}