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
    }
  ]
}