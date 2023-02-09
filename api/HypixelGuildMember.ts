export class HypixelGuildMember {
  readonly uuid: string
  readonly rank: string
  readonly joined: Date
  readonly raw: any

  constructor(raw: any) {
    this.raw = raw
    this.uuid = this.raw.uuid
    this.rank = this.raw.rank
    this.joined = new Date(this.raw.joined)
  }
}
