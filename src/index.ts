// index.ts
import DatabaseManager from './database_manager';

/**
 * Main entry point for the ZSH Documentation Knowledge Base
 */
async function main(): Promise<void> {
  console.log('Starting ZSH Documentation Knowledge Base...');
  
  try {
    // Initialize database
    const dbPath = process.env.DATABASE_PATH || './data/zsh-docs.db';
    const dbManager = new DatabaseManager(dbPath);
    
    // Log successful initialization
    console.log(`Database initialized at: ${dbPath}`);
    
    // Close database when process is terminated
    process.on('SIGINT', () => {
      console.log('Shutting down...');
      dbManager.close();
      process.exit(0);
    });
    
    // Keep process running
    console.log('Server is ready. Press Ctrl+C to exit.');
  } catch (error) {
    console.error(`Initialization error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the application
main().catch((error) => {
  console.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});