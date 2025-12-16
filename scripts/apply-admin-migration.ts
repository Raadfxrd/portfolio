import {config} from "dotenv";
import {resolve} from "path";
import {readFileSync} from "fs";
import postgres from "postgres";

// Load environment variables
config({path: resolve(process.cwd(), ".env")});

async function applyMigration() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error("❌ Error: DATABASE_URL not found in .env");
        process.exit(1);
    }

    console.log("🔧 Connecting to Supabase database...");

    // Create postgres client
    const sql = postgres(databaseUrl);

    try {
        // Read the migration file
        const migrationPath = resolve(
            process.cwd(),
            "server/database/migrations/0001_admin_user.sql",
        );

        console.log("📄 Reading migration file...");
        const migrationSql = readFileSync(migrationPath, "utf-8");

        // Apply the migration
        console.log("⚡ Applying migration...");
        await sql.unsafe(migrationSql);

        console.log("✅ Migration applied successfully!");
        console.log("");
        console.log("Admin user has been created/verified in Supabase");
        console.log(`   Username: ${process.env.ADMIN_USERNAME}`);
        console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
    } catch (error) {
        console.error("❌ Error applying migration:", error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

applyMigration().catch(console.error);
