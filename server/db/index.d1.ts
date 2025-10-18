import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.d1';

export function getDB(d1Database: D1Database) {
  return drizzle(d1Database, { schema });
}

export * from './schema.d1';
