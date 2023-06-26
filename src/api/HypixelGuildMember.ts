import { HypixelAPI } from "./HypixelAPI.js"

export class HypixelGuildMember {
  readonly uuid: string
  readonly rank: string
  readonly joined: Date
  readonly raw: any
  private hypixelAPI: HypixelAPI

  constructor(raw: any, hypixelAPI: HypixelAPI) {
    this.raw = raw
    this.uuid = this.raw.uuid
    this.rank = this.raw.rank
    this.joined = new Date(this.raw.joined)
    this.hypixelAPI = hypixelAPI
  }

  async fetchPlayer() {
    return this.hypixelAPI.fetchPlayer(this.uuid)
  }

  async fetchProfiles() {
    return this.hypixelAPI.fetchProfiles(this.uuid)
  }
}
