import PostgresPool from "../database/Pool.js"
import config from "../config_dev.json" assert { type: "json" };
import assert from "assert";
import { readFile } from "fs/promises";

const pool = new PostgresPool(config.database);
assert(config.database.database.endsWith("dev"));

await pool.transaction(async client => {
  await client.query(await readFile("./src/database/destroy.sql", "utf-8"))
  await client.query(await readFile("./src/database/init.sql", "utf-8"))
});

export default pool;