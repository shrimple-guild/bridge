export type APIGuildResponse = {
  success: boolean;
  guild: APIGuildData | null;
}

export type APIGuildData = {
  _id: string;
  name: string;
  name_lower: string;
  coins: number;
  coinsEver: number;
  created: number;
  members: APIGuildMember[];
  ranks: APIGuildRank[];
  preferredGames: string[];
  description: string;
  achievements: APIGuildAchievements;
  exp: number;
  tag: string;
  tagColor: string;
  chatMute: number;
  guildExpByGameType: APIGuildExperience;
}

export type APIGuildMember = {
  uuid: string;
  rank: string;
  joined: number;
  questParticipation?: number;
  mutedTill?: number;
  expHistory: { [date: string]: number };
}

export type APIGuildRank = {
  name: string;
  default: boolean;
  tag: string;
  created: number;
  priority: number;
}

type APIGuildAchievements = {[achievement: string]: number};

type APIGuildExperience = {[gameType: string]: number};


