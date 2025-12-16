import {config} from "dotenv";
import {resolve} from "path";
import {Resend} from "resend";

// Load environment variables
config({path: resolve(process.cwd(), ".env")});

async function testResend() {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.SMTP_FROM || "onboarding@resend.dev";
    const testEmail = process.env.CONTACT_EMAIL || "borysbabas@pm.me";

    console.log("🧪 Testing Resend Configuration");
    console.log("================================");
    console.log("");
    console.log(
        `API Key: ${apiKey ? apiKey.substring(0, 8) + "..." : "NOT SET"}`,
    );
    console.log(`From: ${fromEmail}`);
    console.log(`To: ${testEmail}`);
    console.log("");

    if (!apiKey) {
        console.error("❌ RESEND_API_KEY is not set in .env");
        process.exit(1);
    }

    const resend = new Resend(apiKey);

    console.log("📧 Sending test email...");
    console.log("");

    try {
        // First test with Resend's verified test domain
        console.log("Test 1: Using Resend test domain (onboarding@resend.dev)");
        const result1 = await resend.emails.send({
            from: "Borys Portfolio Test <onboarding@resend.dev>",
            to: testEmail,
            subject: "Test Email from Resend",
            html: "<p>This is a test email from your portfolio application.</p><p>If you received this, Resend is working correctly!</p>",
        });

        console.log("✅ Test email sent successfully!");
        console.log("Response:", JSON.stringify(result1, null, 2));
        console.log("");

        // Now test with your custom domain if different
        if (fromEmail !== "onboarding@resend.dev") {
            console.log(`Test 2: Using custom domain (${fromEmail})`);
            try {
                const result2 = await resend.emails.send({
                    from: fromEmail,
                    to: testEmail,
                    subject: "Test Email from Custom Domain",
                    html: "<p>This is a test email from your custom domain.</p>",
                });

                console.log("✅ Custom domain email sent successfully!");
                console.log("Response:", JSON.stringify(result2, null, 2));
            } catch (domainError: any) {
                console.error("❌ Custom domain test failed:", domainError.message);
                console.log("");
                console.log(
                    "💡 This likely means your domain is not verified in Resend.",
                );
                console.log("   To fix this:");
                console.log("   1. Go to https://resend.com/domains");
                console.log("   2. Add 'borysbabas.dev' as a domain");
                console.log("   3. Verify it by adding DNS records");
                console.log("   OR");
                console.log(
                    "   4. Use 'onboarding@resend.dev' temporarily by updating SMTP_FROM in .env",
                );
            }
        }

        console.log("");
        console.log("✅ Resend is configured correctly!");
        console.log("   Check your inbox at:", testEmail);
    } catch (error: any) {
        console.error("❌ Failed to send test email");
        console.error("Error:", error);
        console.log("");

        if (error.message?.includes("API key")) {
            console.log("💡 Your API key might be invalid or expired.");
            console.log("   Get a new one at: https://resend.com/api-keys");
        } else if (error.message?.includes("domain")) {
            console.log("💡 Your domain might not be verified.");
            console.log("   Go to: https://resend.com/domains");
        }

        process.exit(1);
    }
}

testResend().catch(console.error);
