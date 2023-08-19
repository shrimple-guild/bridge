import { LinkService } from "../services/LinkService.js";
import pool from "../tests/TestDatabase.js";
import SQL from "sql-template-strings";

const linkService = new LinkService(pool)

// Test cases
async function runTests() {

  await pool.query(SQL`
    INSERT INTO guilds VALUES ('guild');
    INSERT INTO discord_members VALUES ('milo77'), ('appable');
    INSERT INTO minecraft_players VALUES 
      ('milo77', 'milo77', 'milo77'),
      ('kingmilo2345', 'kingmilo2345', 'kingmilo2345');
  `);

  // Test getMinecraft without a link
  const minecraft1 = await linkService.getMinecraft("guild", "milo77");
  console.log("getMinecraft test (unlinked):", minecraft1 === undefined); 

  // Test getDiscord without a link
  const discord1 = await linkService.getDiscord("guild", "milo77");
  console.log("getDiscord test (unlinked):", discord1 === undefined);

  // Test getStatus without a link
  const status1 = await linkService.getStatus("guild", "milo77");
  console.log("getStatus verified test (unlinked):", status1.verified === false); 
  console.log("getStatus linked test (unlinked):", status1.linked === false); 

  // Test linking without a Minecraft IGN
  await linkService.link("guild", "milo77");
  const discord2 = await linkService.getDiscord("guild", "milo77");
  console.log("linking without minecraft test:", discord2 === undefined);

  const status2 = await linkService.getStatus("guild", "milo77");
  console.log("getStatus verified test:", status2.verified === true); 
  console.log("getStatus linked test:", status2.linked === false); 

  // Test linking with a Minecraft IGN
  await linkService.link("guild", "milo77", "milo77");
  const discord3 = await linkService.getDiscord("guild", "milo77");
  console.log("linking with minecraft test:", discord3 === "milo77");

  const status3 = await linkService.getStatus("guild", "milo77");
  console.log("getStatus verified test:", status3.verified === true);
  console.log("getStatus linked test:", status3.linked === true); 

  // Test linking with a new Minecraft IGN
  await linkService.link("guild", "milo77", "kingmilo2345");
  const status4 = await linkService.getStatus("guild", "milo77");
  console.log("linking with new minecraft test:", status4.linked === true); 
  console.log("linking with new minecraft test:", status4.verified === true); 

  const discord4 = await linkService.getDiscord("guild", "milo77");
  console.log("automatically unlink with new minecraft test:", discord4 === undefined); 

  // Test linking a new Discord member to another Minecraft IGN
  const didError = await linkService.link("guild", "appable", "kingmilo2345").then(_ => false).catch(_ => true);
  console.log("link to same IGN test:", didError); // Expected output: true

  // Test unlinking
  await linkService.unlink("guild", "milo77");
  const status5 = await linkService.getStatus("guild", "milo77");
  console.log("linking with new minecraft test:", status5.linked === false); 
  console.log("linking with new minecraft test::", status5.verified === false); 
}

await runTests();