import {config} from "dotenv";
import {resolve} from "path";
import postgres from "postgres";

// Load environment variables
config({path: resolve(process.cwd(), ".env")});

async function fixSequences() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error("❌ Error: DATABASE_URL not found in .env");
        process.exit(1);
    }

    console.log("🔧 Fixing PostgreSQL sequences...");
    console.log("");

    const sql = postgres(databaseUrl);

    try {
        // Fix blog_posts sequence
        console.log("📝 Fixing blog_posts sequence...");
        const blogPostsResult = await sql`
      SELECT setval(
        pg_get_serial_sequence('blog_posts', 'id'),
        COALESCE((SELECT MAX(id) FROM blog_posts), 0) + 1,
        false
      );
    `;
        console.log("✅ blog_posts sequence fixed");
        console.log(`   Next ID will be: ${blogPostsResult[0]?.setval || 1}`);
        console.log("");

        // Fix users sequence
        console.log("👤 Fixing users sequence...");
        const usersResult = await sql`
      SELECT setval(
        pg_get_serial_sequence('users', 'id'),
        COALESCE((SELECT MAX(id) FROM users), 0) + 1,
        false
      );
    `;
        console.log("✅ users sequence fixed");
        console.log(`   Next ID will be: ${usersResult[0]?.setval || 1}`);
        console.log("");

        // Fix newsletter sequence
        console.log("📰 Fixing newsletter sequence...");
        const newsletterResult = await sql`
      SELECT setval(
        pg_get_serial_sequence('newsletter', 'id'),
        COALESCE((SELECT MAX(id) FROM newsletter), 0) + 1,
        false
      );
    `;
        console.log("✅ newsletter sequence fixed");
        console.log(`   Next ID will be: ${newsletterResult[0]?.setval || 1}`);
        console.log("");

        // Verify by checking current sequences
        console.log("🔍 Verifying sequences...");
        const sequences = await sql`
      SELECT 
        schemaname,
        sequencename,
        last_value
      FROM pg_sequences
      WHERE schemaname = 'public'
      ORDER BY sequencename;
    `;

        console.log("Current sequences:");
        sequences.forEach((seq: any) => {
            console.log(`   ${seq.sequencename}: ${seq.last_value}`);
        });
        console.log("");

        console.log("✅ All sequences fixed successfully!");
        console.log("");
        console.log("💡 You can now create new blog posts without errors.");
    } catch (error) {
        console.error("❌ Error fixing sequences:", error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

fixSequences().catch(console.error);
