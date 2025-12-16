import {config} from "dotenv";
import {resolve} from "path";
import {db} from "~/server/database/client";
import {users} from "~/server/database/schema";
import {eq} from "drizzle-orm";
import bcrypt from "bcryptjs";

// Load environment variables
config({path: resolve(process.cwd(), ".env")});

async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

async function createAdminUser() {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const email = process.env.ADMIN_EMAIL || "admin@example.com";

    if (
        !process.env.ADMIN_USERNAME ||
        !process.env.ADMIN_PASSWORD ||
        !process.env.ADMIN_EMAIL
    ) {
        console.warn(
            "⚠️  Warning: Admin credentials not found in .env file. Using default values.",
        );
        console.warn(
            "⚠️  Please set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_EMAIL in your .env file.",
        );
    }

    console.log("🔧 Creating admin user...");
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);

    try {
        // Check if admin already exists
        const existing = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (existing.length > 0) {
            console.log("❌ Admin user already exists!");
            console.log("   Updating password...");

            // Update existing admin's password
            const hashedPassword = await hashPassword(password);
            await db
                .update(users)
                .set({
                    password: hashedPassword,
                    email: email,
                })
                .where(eq(users.username, username));

            console.log("✅ Admin password updated successfully!");
            process.exit(0);
            return;
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);

        await db.insert(users).values({
            username,
            password: hashedPassword,
            email,
        });

        console.log("✅ Admin user created successfully!");
        console.log(`   Database: PostgreSQL (Supabase)`);
        console.log(`   Username: ${username}`);
        console.log(`   Email: ${email}`);
        console.log("⚠️  Please change the default credentials in production!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
        console.error("\n💡 Make sure:");
        console.error("   1. DATABASE_URL is set correctly in .env");
        console.error(
            "   2. You've run the SQL setup in Supabase (supabase-setup.sql)",
        );
        console.error("   3. Your Supabase database is accessible");
        process.exit(1);
    }
}

createAdminUser().catch(console.error);
