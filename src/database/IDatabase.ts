import { Statement } from "better-sqlite3";

export interface IDatabase {
  prepare<I extends unknown[], O>(query: string): Statement<I, O>;
}