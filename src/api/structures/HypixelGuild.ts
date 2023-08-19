import { APIGuildResponse, APIGuildData, APIGuildMember, APIGuildRank } from "./APIGuildResponse.js";

export class HypixelGuild {
  private constructor(public raw: APIGuildData) {}

  static async create(response: APIGuildResponse) {
    if (response.success && response.guild) {
      return new HypixelGuild(response.guild);
    }
  }

  get members() {
    return this.raw.members
  }

  get uuidList() {
    return this.members.map(member => member.uuid)
  }

  getGuildMember = (uuid: string) => HypixelGuildMember.from(
    this, this.members.find(member => member.uuid == uuid)
  );

  getRankByTag = (name: string) => HypixelGuildRank.from(
    this, this.raw.ranks.find(rank => rank.tag)
  );

  getRankByName = (name: string) => HypixelGuildRank.from(
    this, this.raw.ranks.find(rank => rank.name)
  );

}

export class HypixelGuildRank {
  private constructor(public guild: HypixelGuild, public raw: APIGuildRank) {};

  static from(guild: HypixelGuild, raw: APIGuildRank | undefined) {
    if (raw) return new HypixelGuildRank(guild, raw)
  }

  get name() { return this.raw.name }
  get tag() { return this.raw.tag }
  get priority() { return this.raw.priority }
}

export class HypixelGuildMember {

  private constructor(public guild: HypixelGuild, public raw: APIGuildMember) {}

  static from(guild: HypixelGuild, raw: APIGuildMember | undefined) {
    if (raw) return new HypixelGuildMember(guild, raw)
  }
  
  get uuid() { return this.raw.uuid } 
  get rank() { return this.guild.getRankByName(this.raw.rank) }

  get expHistory() {
    const history = this.raw.expHistory
    return Object.entries(history).map(([date, exp]) => {
      return { date: new Date(date), exp: exp }
    })
  }

  get weeklyExp() {
    return this.expHistory.reduce((cum, { exp }) => cum += exp, 0)
  }

  get dailyExp() {
    return this.expHistory.at(0)?.exp ?? 0
  }
}