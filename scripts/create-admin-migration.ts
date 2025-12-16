import {config} from "dotenv";
import {resolve} from "path";
import {writeFileSync} from "fs";
import bcrypt from "bcryptjs";

// Load environment variables
config({path: resolve(process.cwd(), ".env")});

async function generateMigration() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    const email = process.env.ADMIN_EMAIL;

    if (!username || !password || !email) {
        console.error(
            "❌ Error: ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_EMAIL must be set in .env",
        );
        process.exit(1);
    }

    console.log("🔧 Generating admin user migration...");
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create migration file name
    const migrationName = `0001_admin_user`;
    const migrationFile = `${migrationName}.sql`;
    const migrationPath = resolve(
        process.cwd(),
        "server/database/migrations",
        migrationFile,
    );

    // Create the SQL migration
    const sqlContent = `-- Migration: Insert admin user
-- Generated: ${new Date().toISOString()}

-- Insert admin user with hashed password
-- This migration is idempotent - it will skip if user already exists
DO $$
BEGIN
  -- Check if admin user already exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = '${username.replace(/'/g, "''")}') THEN
    INSERT INTO users (username, password, email, created_at)
    VALUES (
      '${username.replace(/'/g, "''")}',
      '${hashedPassword}',
      '${email.replace(/'/g, "''")}',
      NOW()
    );
    RAISE NOTICE 'Admin user created successfully';
  ELSE
    RAISE NOTICE 'Admin user already exists, skipping';
  END IF;
END $$;
`;

    // Write the migration file
    try {
        writeFileSync(migrationPath, sqlContent, "utf-8");
        console.log(`✅ Migration file created: ${migrationFile}`);
        console.log(`   Path: ${migrationPath}`);
        console.log("");
        console.log("📝 Next steps:");
        console.log("   1. Review the migration file");
        console.log("   2. Run: npm run db:migrate");
        console.log("   Or apply it directly to your Supabase database");
    } catch (error) {
        console.error("❌ Error writing migration file:", error);
        process.exit(1);
    }
}

generateMigration().catch(console.error);
