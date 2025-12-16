#!/usr/bin/env tsx

/**
 * Initialize Supabase Database
 * This script pushes your schema to Supabase
 */

import {config} from "dotenv";
import {resolve} from "path";
import {execSync} from "child_process";

config({path: resolve(process.cwd(), ".env")});

console.log("🚀 Initializing Supabase Database...\n");

// Check if DATABASE_URL is set
if (
    !process.env.DATABASE_URL ||
    !process.env.DATABASE_URL.includes("supabase")
) {
    console.error("❌ DATABASE_URL not set or doesn't point to Supabase");
    console.error(
        "   Please update your .env file with your Supabase connection string",
    );
    console.error(
        "   Get it from: Supabase Dashboard → Settings → Database → Connection string",
    );
    process.exit(1);
}

console.log(
    "📊 Database URL:",
    process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"),
);

try {
    console.log("\n📤 Pushing schema to Supabase...");
    console.log("   This will create/update your tables\n");

    execSync("npm run db:push", {
        stdio: "inherit",
        env: process.env,
    });

    console.log("\n✅ Schema pushed successfully!");
    console.log("\n📝 Next step: Create admin user");
    console.log("   Run: npm run db:init\n");
} catch (error) {
    console.error("\n❌ Failed to push schema to Supabase");
    console.error("   Error:", error);
    console.error("\n💡 Alternative: Run the SQL manually");
    console.error("   1. Open supabase-setup.sql");
    console.error("   2. Copy its contents");
    console.error("   3. Paste in Supabase SQL Editor");
    console.error("   4. Run the query");
    process.exit(1);
}
