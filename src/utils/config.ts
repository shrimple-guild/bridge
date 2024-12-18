import fs from "fs/promises";

export type GuildRole = {
    name: string;
    sbLevel: number;
    fishingXp: number;
    priority: number;
};

type Config = {
    minecraft: {
        username: string;
        privilegedUsers: string[];
    };
    discord: {
        guildRequirements: boolean;
        token: string;
        client: string;
        guild: string;
        channel: string;
        shutdownWebhook: string;
        loggerWebhook: string;
        verification: {
            channelId: string;
            unverifiedRole: string;
            verifiedRole: string;
        };
    };
    bridge: {
        prefix: string;
        apiKey: string;
        hypixelGuild: string;
    };
    roles: {
        hypixelTag: string;
        discord: string;
        isStaff: boolean;
    }[];
    guildRoles: GuildRole[];
    joinRequirements: {
        sbLevel: number;
        overflowFishingXp: number;
    }[];
};

export let config = JSON.parse(await fs.readFile("./src/config.json", "utf-8")) as Config;