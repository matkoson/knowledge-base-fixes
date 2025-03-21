// validate_db.ts
import { existsSync } from 'fs';
import { join } from 'path';
import sqliteAdapter from './sqlite_adapter';

/**
 * Validates the database structure and integrity
 */
async function validateDatabase(): Promise<boolean> {
  // Path to database
  const dbPath = process.env.DATABASE_PATH || './data/zsh-docs.db';
  
  console.log(`Validating database at: ${dbPath}`);
  
  // Check if database file exists
  if (!existsSync(dbPath)) {
    console.error(`Database file does not exist: ${dbPath}`);
    return false;
  }
  
  try {
    // Open database connection
    const db = new sqliteAdapter.Database(dbPath);
    
    // Check if tables exist
    const tablesStmt = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='zsh_sections'
    `);
    
    const result = tablesStmt.get() as { name: string } | null;
    
    if (!result) {
      console.error('Required table "zsh_sections" does not exist');
      db.close();
      return false;
    }
    
    // Validate table schema
    const schemaStmt = db.prepare(`PRAGMA table_info(zsh_sections)`);
    const columns = schemaStmt.all() as Array<{
      name: string;
      type: string;
      notnull: number;
      pk: number;
    }>;
    
    // Expected schema
    const expectedColumns = [
      { name: 'id', type: 'INTEGER', pk: 1 },
      { name: 'title', type: 'TEXT', notnull: 1 },
      { name: 'content', type: 'TEXT', notnull: 1 },
      { name: 'source', type: 'TEXT', notnull: 1 },
      { name: 'section_type', type: 'TEXT', notnull: 1 },
      { name: 'parent_id', type: 'INTEGER', notnull: 0 }
    ];
    
    // Check each expected column
    for (const expected of expectedColumns) {
      const column = columns.find(c => c.name === expected.name);
      
      if (!column) {
        console.error(`Missing column: ${expected.name}`);
        db.close();
        return false;
      }
      
      if (column.type !== expected.type) {
        console.error(`Column ${expected.name} has incorrect type: ${column.type} (expected ${expected.type})`);
        db.close();
        return false;
      }
      
      if (expected.pk && column.pk !== 1) {
        console.error(`Column ${expected.name} should be a primary key`);
        db.close();
        return false;
      }
      
      if (expected.notnull && column.notnull !== 1) {
        console.error(`Column ${expected.name} should be NOT NULL`);
        db.close();
        return false;
      }
    }
    
    // Check if database is writable
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS _validation_test (
          id INTEGER PRIMARY KEY,
          test_value TEXT
        )
      `).run();
      
      db.prepare(`
        INSERT INTO _validation_test (test_value)
        VALUES (?)
      `).run('Test value ' + Date.now());
      
      db.prepare(`DROP TABLE _validation_test`).run();
    } catch (error) {
      console.error(`Database is not writable: ${error instanceof Error ? error.message : String(error)}`);
      db.close();
      return false;
    }
    
    // Close database connection
    db.close();
    
    console.log('Database validation successful');
    return true;
  } catch (error) {
    console.error(`Database validation failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateDatabase()
    .then(isValid => {
      if (!isValid) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    });
}

export default validateDatabase;