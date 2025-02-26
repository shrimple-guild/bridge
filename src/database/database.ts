import db from "better-sqlite3"
import { existsSync, mkdirSync } from "fs"
import { migrations } from "./migrations.js"
import { IDatabase } from "./IDatabase.js"

type Migration = {
  init: { script: string },
  migrations: { version: number, script: string }[]
}

export class Database implements IDatabase {

  private database: db.Database
  private backupsPath: string
  private isInMemory: boolean
  
  private constructor(directory: string, private migrationData: Migration) {
    let databaseExists = false
    if (directory != ":memory:") {
      this.backupsPath = `${directory}/backups`
      if (!existsSync(this.backupsPath)) mkdirSync(this.backupsPath)
      databaseExists = existsSync(`${directory}/main.db`)
      this.database = new db(`${directory}/main.db`)
      this.isInMemory = false
    } else {
      this.backupsPath = ""
      this.database = new db(":memory:")
      this.isInMemory = true
    }
    if (!databaseExists) {
      const initial = migrationData.init.script
      this.withTransaction(() => this.exec(initial))
    }
  }

  static async create(directory: string, migrationData: Migration) {
    const database = new Database(directory, migrationData)
    await database.migrate()
    return database
  }

  prepare<I extends unknown[], O>(query: string) {
    return this.database.prepare<I, O>(query)
  }

  exec(statements: string) {
    this.database.exec(statements)
  }

  withTransaction<T>(cb: () => T) {
    return this.database.transaction(cb)()
  }

  get version() {
    return (this.prepare("PRAGMA user_version").get() as any).user_version
  }

  set version(version: number) {
    this.prepare(`PRAGMA user_version = ${version}`).run()
  }

  private async migrate() {
    const migrations = this.migrationData.migrations
    const highestVersion = Math.max(...migrations.map(migration => migration.version))
    if (this.version == highestVersion) return
    if (!this.isInMemory) {
      await this.database.backup(`${this.backupsPath}/main_${this.version}_${Date.now()}.db`)
    }
    this.withTransaction(() => {
      for (let newVersion = this.version + 1; newVersion <= highestVersion; newVersion++) {
        const migration = migrations.find(migration => migration.version == newVersion) 
        if (!migration) {
          throw new Error(`Couldn't locate a migration to version ${newVersion}! Aborting.`)
        }
        this.exec(migration.script)
        this.version = newVersion
      }
    })
  }
}

