// database_manager.ts
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import sqliteAdapter, { SQLiteDatabase, SQLiteStatement } from './sqlite_adapter';

// Define interfaces for better type safety
export interface ZshSection {
  id?: number;
  title: string;
  content: string;
  source: string;
  section_type: string;
  parent_id?: number | null;
}

export class DatabaseManager {
  private db: SQLiteDatabase;
  private statements: Record<string, SQLiteStatement> = {};

  constructor(dbPath: string) {
    // Ensure data directory exists
    const dirPath = dirname(dbPath);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    // Initialize database
    this.db = new sqliteAdapter.Database(dbPath);
    this.setupDatabase();
  }

  private setupDatabase(): void {
    // Create tables if they don't exist
    this.execute(`
      CREATE TABLE IF NOT EXISTS zsh_sections (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        source TEXT NOT NULL,
        section_type TEXT NOT NULL,
        parent_id INTEGER
      )
    `);
  }

  /**
   * Executes an SQL statement without returning results
   */
  private execute(sql: string, ...params: unknown[]): void {
    try {
      const stmt = this.db.prepare(sql);
      stmt.run(...params);
    } catch (error) {
      console.error(`Database execution error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to execute SQL: ${sql}`);
    }
  }

  /**
   * Prepares and caches a statement for repeated use
   */
  private prepareStatement(key: string, sql: string): SQLiteStatement {
    if (!this.statements[key]) {
      this.statements[key] = this.db.prepare(sql);
    }
    return this.statements[key];
  }

  /**
   * Inserts a new ZSH documentation section
   */
  insertSection(section: ZshSection): number {
    try {
      const stmt = this.prepareStatement('insertSection', `
        INSERT INTO zsh_sections (title, content, source, section_type, parent_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        section.title,
        section.content,
        section.source,
        section.section_type,
        section.parent_id || null
      );
      
      return Number(result.lastInsertRowid);
    } catch (error) {
      console.error(`Failed to insert section: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to insert section: ${section.title}`);
    }
  }

  /**
   * Gets a section by ID
   */
  getSection(id: number): ZshSection | null {
    try {
      const stmt = this.prepareStatement('getSection', `
        SELECT id, title, content, source, section_type, parent_id
        FROM zsh_sections
        WHERE id = ?
      `);
      
      return stmt.get(id) as ZshSection | null;
    } catch (error) {
      console.error(`Failed to get section: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Gets all sections
   */
  getAllSections(): ZshSection[] {
    try {
      const stmt = this.prepareStatement('getAllSections', `
        SELECT id, title, content, source, section_type, parent_id
        FROM zsh_sections
        ORDER BY id
      `);
      
      return stmt.all() as ZshSection[];
    } catch (error) {
      console.error(`Failed to get all sections: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Searches for sections by title or content
   */
  searchSections(query: string): ZshSection[] {
    try {
      const stmt = this.prepareStatement('searchSections', `
        SELECT id, title, content, source, section_type, parent_id
        FROM zsh_sections
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY id
      `);
      
      const searchParam = `%${query}%`;
      return stmt.all(searchParam, searchParam) as ZshSection[];
    } catch (error) {
      console.error(`Failed to search sections: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Closes the database connection and finalizes all prepared statements
   */
  close(): void {
    try {
      // Finalize all prepared statements
      Object.values(this.statements).forEach(stmt => {
        if (typeof stmt.finalize === 'function') {
          stmt.finalize();
        }
      });
      
      // Clear statements cache
      this.statements = {};
      
      // Close database
      this.db.close();
    } catch (error) {
      console.error(`Error closing database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default DatabaseManager;