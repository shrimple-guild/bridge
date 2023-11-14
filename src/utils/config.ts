import fs from "fs";

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
    guildRoles: {
        name: string;
        sbLevel: number;
        fishingXp: number;
        priority: number;
    }[];
    joinRequirements: {
        sbLevel: number;
        overflowFishingXp: number;
    }[];
};

export let config = JSON.parse(fs.readFileSync("./src/config.json", "utf-8")) as Config;