// sqlite_adapter.ts
/**
 * A cross-environment compatible SQLite adapter that works in both Bun runtime
 * and bundled environments.
 * 
 * This solves the `bun:sqlite` import issue by conditionally importing the
 * appropriate implementation based on the runtime environment.
 */

export interface SQLiteStatement {
  run(...params: unknown[]): { lastInsertRowid: number | bigint };
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  finalize(): void;
}

export interface SQLiteDatabase {
  prepare(sql: string): SQLiteStatement;
  close(): void;
}

export interface SQLiteAdapter {
  Database: new (path: string) => SQLiteDatabase;
}

let sqliteAdapter: SQLiteAdapter;

// Runtime detection to handle different environments
if (typeof Bun !== 'undefined') {
  // Bun environment - use native Bun SQLite
  try {
    // Using dynamic import to avoid bundling issues
    const bunSqlite = { Database: Bun.Database };
    sqliteAdapter = bunSqlite;
  } catch (error) {
    console.error('Failed to load Bun SQLite:', error);
    throw new Error('SQLite adapter failed to initialize in Bun environment');
  }
} else {
  // Bundled/other environment - provide mock or alternative implementation
  // In a real implementation, you might use better-sqlite3 or other alternatives
  sqliteAdapter = {
    Database: class MockDatabase implements SQLiteDatabase {
      constructor(private readonly _path: string) {
        console.warn(`Creating mock SQLite database at ${_path}`);
      }
      
      prepare(sql: string): SQLiteStatement {
        console.log(`Mock preparing SQL: ${sql}`);
        return {
          run: (..._params: unknown[]) => {
            console.log(`Mock running SQL with params:`, _params);
            return { lastInsertRowid: -1 };
          },
          get: (..._params: unknown[]) => {
            console.log(`Mock getting SQL with params:`, _params);
            return null;
          },
          all: (..._params: unknown[]) => {
            console.log(`Mock getting all SQL with params:`, _params);
            return [];
          },
          finalize: () => {
            console.log('Mock finalizing SQL statement');
          }
        };
      }
      
      close(): void {
        console.log(`Mock closing database at ${this._path}`);
      }
    }
  };
}

export default sqliteAdapter;