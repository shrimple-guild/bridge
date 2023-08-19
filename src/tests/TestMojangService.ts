import { LinkService } from "../services/LinkService.js";
import pool from "../tests/TestDatabase.js";
import SQL from "sql-template-strings";

const linkService = new LinkService(pool);

// Before each test, reset the database
beforeEach(async () => {
  await pool.query(SQL`
    DELETE FROM guilds;
    DELETE FROM discord_members;
    DELETE FROM minecraft_players;
  `);

  await pool.query(SQL`
    INSERT INTO guilds VALUES ('guild');
    INSERT INTO discord_members VALUES ('milo77'), ('appable');
    INSERT INTO minecraft_players VALUES 
      ('milo77', 'milo77', 'milo77'),
      ('kingmilo2345', 'kingmilo2345', 'kingmilo2345');
  `);
});

describe("LinkService tests", () => {
  test("getMinecraft without a link", async () => {
    const minecraft1 = await linkService.getMinecraft("guild", "milo77");
    expect(minecraft1).toBeUndefined();
  });

  test("getDiscord without a link", async () => {
    const discord1 = await linkService.getDiscord("guild", "milo77");
    expect(discord1).toBeUndefined();
  });

  test("getStatus without a link", async () => {
    const status1 = await linkService.getStatus("guild", "milo77");
    expect(status1.verified).toBe(false);
    expect(status1.linked).toBe(false);
  });

  test("linking without a Minecraft IGN", async () => {
    await linkService.link("guild", "milo77");
    const discord2 = await linkService.getDiscord("guild", "milo77");
    expect(discord2).toBeUndefined();

    const status2 = await linkService.getStatus("guild", "milo77");
    expect(status2.verified).toBe(true);
    expect(status2.linked).toBe(false);
  });

  test("linking with a Minecraft IGN", async () => {
    await linkService.link("guild", "milo77", "milo77");
    const discord3 = await linkService.getDiscord("guild", "milo77");
    expect(discord3).toBe("milo77");

    const status3 = await linkService.getStatus("guild", "milo77");
    expect(status3.verified).toBe(true);
    expect(status3.linked).toBe(true);
  });

  test("linking with a new Minecraft IGN", async () => {
    await linkService.link("guild", "milo77", "kingmilo2345");
    const status4 = await linkService.getStatus("guild", "milo77");
    expect(status4.linked).toBe(true);
    expect(status4.verified).toBe(true);

    const discord4 = await linkService.getDiscord("guild", "milo77");
    expect(discord4).toBeUndefined();
  });

  test("linking a new Discord member to another Minecraft IGN", async () => {
    const didError = await linkService.link("guild", "appable", "kingmilo2345").then(
      () => false
    ).catch(() => true);
    expect(didError).toBe(true);
  });

  test("unlinking", async () => {
    await linkService.unlink("guild", "milo77");
    const status5 = await linkService.getStatus("guild", "milo77");
    expect(status5.linked).toBe(false);
    expect(status5.verified).toBe(false);
  });
});