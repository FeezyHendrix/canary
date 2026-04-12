#!/bin/sh
set -e

echo "Running database migrations..."
node --input-type=module -e "
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
await migrate(db, { migrationsFolder: './migrations' });
await pool.end();
console.log('Migrations completed.');
"

echo "Starting Canary..."
exec node dist/server.js
