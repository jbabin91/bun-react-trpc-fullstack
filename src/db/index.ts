import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

// Get database URL from environment variables
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://localhost:5432/react_bun_dev';

// Create PostgreSQL connection
const client = postgres(DATABASE_URL);

// Create Drizzle database instance
export const db = drizzle(client, { casing: 'snake_case', schema });

// Export the client instance if needed for raw queries
export { client };
