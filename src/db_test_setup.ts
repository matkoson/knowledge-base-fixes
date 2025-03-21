// db_test_setup.ts
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import sqliteAdapter from './sqlite_adapter';

export async function setupTestDatabase(dbName = 'test-zsh-docs.db'): Promise<string> {
  // Ensure data directory exists
  const dataDir = './data';
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  
  const dbPath = join(dataDir, dbName);
  
  // Create test database with minimum required schema
  const db = new sqliteAdapter.Database(dbPath);
  
  // Create tables
  db.prepare(`
    CREATE TABLE IF NOT EXISTS zsh_sections (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT NOT NULL,
      section_type TEXT NOT NULL,
      parent_id INTEGER
    )
  `).run();
  
  // Insert test data
  db.prepare(`
    INSERT INTO zsh_sections (title, content, source, section_type)
    VALUES (?, ?, ?, ?)
  `).run(
    'Test Section',
    'Test Content',
    'test.html',
    'h1'
  );
  
  db.close();
  
  return dbPath;
}

export async function cleanupTestDatabase(dbPath: string): Promise<void> {
  try {
    // In a real implementation, you might delete the file here
    console.log(`[Test] Would delete test database at: ${dbPath}`);
  } catch (error) {
    console.error(`Error cleaning up test database: ${error instanceof Error ? error.message : String(error)}`);
  }
}