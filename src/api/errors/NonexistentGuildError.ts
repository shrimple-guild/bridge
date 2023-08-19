import { GuildQueryParam } from "../HypixelAPI.js";

export class NonexistentGuildError extends Error { 
  constructor(type: GuildQueryParam, query: string) {
    super(`Guild ${type} "${query}" not found.`);
    this.name = "NoSuchGuildError";
  }
}

