
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

export const pool = new Database("sqlite.db");
export const db = drizzle(pool, { schema });
