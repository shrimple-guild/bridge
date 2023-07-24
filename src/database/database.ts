import pg, { PoolClient } from 'pg';

const { Pool } = pg

interface DBConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

export default class Postgres extends Pool {

  constructor(config: DBConfig) {
    super(config)
  }

  public async do<T>(cb: (connection: PoolClient) => T): Promise<T> {
    const connection = await this.connect();
    try {
      return await cb(connection)
    } finally {
      connection.release();
    }
  }
}
