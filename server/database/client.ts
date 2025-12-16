import type {PostgresJsDatabase} from "drizzle-orm/postgres-js";
import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy connection initialization
let _db: PostgresJsDatabase<typeof schema> | null = null;
let _sql: ReturnType<typeof postgres> | null = null;

// Function to get database URL from various sources
function getDatabaseUrl(): string {
    // First try process.env (for scripts, migrations, and Nuxt server)
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }

    // In Nuxt server context, try runtime config
    try {
        // @ts-ignore - useRuntimeConfig is available in Nuxt server context
        const config = useRuntimeConfig?.();
        if (config?.databaseUrl) {
            return config.databaseUrl;
        }
    } catch (e) {
        // Runtime config not available (likely running outside Nuxt context)
    }

    throw new Error(
        "DATABASE_URL environment variable is required. Make sure it's set in your .env file.",
    );
}

// Initialize database connection (lazy)
function initializeDatabase() {
    if (_db) {
        return {db: _db, sql: _sql!};
    }

    const connectionString = getDatabaseUrl();

    console.log(
        "🔗 Initializing database connection:",
        connectionString.replace(/:[^:@]+@/, ":****@"),
    );

    // Create postgres connection
    _sql = postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
    });

    // Create Drizzle ORM instance with the postgres connection
    _db = drizzle(_sql, {schema});

    return {db: _db, sql: _sql};
}

// Export getters that initialize on first access
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
    get(_, prop) {
        const {db} = initializeDatabase();
        return (db as any)[prop];
    },
});

// Export the raw SQL connection getter
export default new Proxy({} as ReturnType<typeof postgres>, {
    get(_, prop) {
        const {sql} = initializeDatabase();
        return (sql as any)[prop];
    },
    apply(_, __, args) {
        const {sql} = initializeDatabase();
        return (sql as any)(...args);
    },
});
