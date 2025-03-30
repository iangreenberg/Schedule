import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '@shared/schema';
import { fileURLToPath } from 'url';

// For CLI
async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// For import from other files
export async function migrateDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Database migrations completed');
    return true;
  } catch (error) {
    console.error('Database migration failed:', error);
    return false;
  }
}

// Run migrations if this is called directly via node (ESM version of require.main === module)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration script error:', error);
      process.exit(1);
    });
}