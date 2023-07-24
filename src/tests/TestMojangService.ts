import { MojangService } from "../services/MojangService.js";
import PostgresPool from "../database/Pool.js";
import { readFile } from "fs/promises";
import config from "../config_dev.json" assert { type: "json" };

const pool = new PostgresPool(config.database)

const sql = await readFile("./src/database/init.sql", "utf-8")
await pool.transaction(async client => {
  await client.query(sql)
})

const mojangService = new MojangService(pool)

