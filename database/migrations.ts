export const migrations = {
  init: {
    script: `
      CREATE TABLE Members (
        username TEXT PRIMARY KEY,
        skin TEXT NOT NULL,
        lastUpdated INTEGER NOT NULL
      );
    `
  },
  migrations: [
    {
      version: 1,
      script: `
        ALTER TABLE Members RENAME TO MembersOld;
  
        CREATE TABLE Members (
          username TEXT PRIMARY KEY,
          skin TEXT,
          skinLastUpdated INTEGER NOT NULL DEFAULT 0,
          uuid TEXT,
          uuidLastUpdated INTEGER NOT NULL DEFAULT 0
        );
        
        INSERT INTO Members (username, skin, skinLastUpdated) 
        SELECT username, skin, lastUpdated
        FROM MembersOld;
  
        DROP TABLE MembersOld;
      `
    },
    {
      version: 2,
      script: `
        CREATE TABLE DiscordMembers (
          guildId TEXT NOT NULL,
          discordId TEXT NOT NULL,
          minecraftId TEXT UNIQUE,
          PRIMARY KEY (guildId, discordId)
        );
      `
    },
    {
      version: 3,
      script: `
        CREATE TABLE Players (
          id TEXT PRIMARY KEY,
          guildId TEXT,
          skin TEXT,
          skinLastUpdated INTEGER NOT NULL DEFAULT 0,
          name TEXT UNIQUE,
          nameLastUpdated INTEGER NOT NULL DEFAULT 0
        );
        DROP TABLE Members;
        CREATE TABLE Profiles (
          id INTEGER PRIMARY KEY,
          playerId TEXT NOT NULL,
          hypixelId TEXT NOT NULL,
          name TEXT NOT NULL,
          selected INTEGER NOT NULL,
          UNIQUE (playerId, hypixelId)
          FOREIGN KEY (playerId) REFERENCES Players(id)
        );
        CREATE TABLE Metrics (
          id INTEGER PRIMARY KEY,
          profileId INTEGER NOT NULL,
          timestamp INTEGER NOT NULL,
          metric TEXT NOT NULL,
          value REAL,
          UNIQUE (profileId, timestamp),
          FOREIGN KEY (profileId) REFERENCES Profiles(id)
        );
      `
    }
  ]
}