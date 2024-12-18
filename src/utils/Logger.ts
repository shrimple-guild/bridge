import { WebhookClient } from "discord.js"
import { config } from "./config.js"

export type LoggerCategory = {
  error: (content: string, error?: any) => void
  info: (content: string) => void
  warn: (content: string) => void
  debug: (content: string) => void
}

export class Logger {
  private loggerWebhookClient?: WebhookClient = config.discord.loggerWebhook ? new WebhookClient({ url: config.discord.loggerWebhook }) : undefined
  private queueBuffer = ""
  private maxCharacters = 1800

  private queueTimeout?: NodeJS.Timeout

  category(category: string) {
    return {
      error: (content: string, error?: any) => {
        if (error instanceof Error) {
          this.log(category, `${content}\n${error.stack ?? "No stack available"}`, 31)
        } else {
          this.log(category, content, 31)
        }
      },
      info: (content: string) => this.log(category, content, 32),
      warn: (content: string) => this.log(category, content, 33),
      debug: (content: string) => this.log(category, content, 34)
    }
  }

  private async log(category: string, content: string, color: number) {
    const message = `\x1b[${color}m[${new Date().toISOString()}] ${category} - \x1b[0m${content}`

    console.log(message)

    const logMessage = `${message}\n`

    if (this.queueBuffer.length + logMessage.length >= this.maxCharacters) {
      if (this.queueTimeout) {
        clearTimeout(this.queueTimeout)
      }
      this.sendQueue()
    }

    this.queueBuffer += logMessage
    if (this.queueTimeout) {
      clearTimeout(this.queueTimeout)
    }
    this.queueTimeout = setTimeout(() => {
      this.sendQueue()
    }, 500)
  }

  private sendQueue() {
    if (this.loggerWebhookClient) {
      this.loggerWebhookClient.send({
        content: `\`\`\`ansi\n${this.queueBuffer}\`\`\``
      }).catch(e => undefined)
    }
    this.queueBuffer = ""
  }
}