import pg, { PoolClient } from 'pg';
const { Pool } = pg;

interface DBConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
}

export default class PostgresPool extends Pool {

  constructor(config: DBConfig) {
    super(config);
  }

  async transaction<T>(cb: (client: PoolClient) => T, client?: PoolClient) {
    const transactionClient = client ?? await this.connect()
    try {
      await transactionClient.query('BEGIN')
      await cb(transactionClient)
      await transactionClient.query('COMMIT')
    } catch (e) {
      await transactionClient.query('ROLLBACK')
      throw e
    } finally {
      transactionClient.release()
    }
  }
}