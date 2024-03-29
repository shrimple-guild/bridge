export type LoggerCategory = {
  error: (content: string, error?: any) => void
  info: (content: string) => void
  warn: (content: string) => void
  debug: (content: string) => void
}

export class Logger {

  category(name: string) {
    return {
      error: (content: string, error?: any) => {
        if (error instanceof Error) {
          this.log(name, `${content}\n${error.stack ?? "No stack available"}`, 31)
        } else {
          this.log(name, content, 31)
        }
      },
      info: (content: string) => this.log(name, content, 32),
      warn: (content: string) => this.log(name, content, 33),
      debug: (content: string) => this.log(name, content, 34)
    }
  }

  private log(name: string, content: string, color: number) {
    console.log(`\x1b[${color}m[${new Date().toISOString()}] ${name} - \x1b[0m${content}`)
  }
}