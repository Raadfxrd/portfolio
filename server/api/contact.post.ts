import {sendEmail} from "~/server/utils/email";
import {verifyRecaptcha} from "~/server/utils/recaptcha";

interface ContactFormBody {
    name: string;
    email: string;
    message: string;
    recaptchaToken?: string;
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody<ContactFormBody>(event);

        // Validate body exists
        if (!body) {
            throw createError({
                status: 400,
                message: "Request body is required",
            });
        }

        const {name, email, message, recaptchaToken} = body;

        // Validate input
        if (!name || !email || !message) {
            throw createError({
                status: 400,
                message: "Missing required fields",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw createError({
                status: 400,
                message: "Invalid email format",
            });
        }

        // Verify reCAPTCHA token
        const isDevelopment = process.env.NODE_ENV === "development";
        const shouldSkipRecaptcha = process.env.SKIP_RECAPTCHA === "true";

        if (recaptchaToken) {
            // Only verify if we have a token
            await verifyRecaptcha({
                token: recaptchaToken,
                minScore: 0.5, // Require at least 0.5 score for contact form
                expectedAction: "submit_contact", // Verify the action matches
            });
        } else {
            // No token provided
            if (!isDevelopment && !shouldSkipRecaptcha) {
                throw createError({
                    status: 400,
                    message: "reCAPTCHA token is required",
                });
            } else {
                console.log(
                    "ℹ️  reCAPTCHA verification skipped (development mode or SKIP_RECAPTCHA=true)",
                );
            }
        }

        // Prepare email content
        const contactEmail = process.env.CONTACT_EMAIL || "borysbabas@pm.me";
        const subject = `Contact request: ${name}`;
        const text = `
Name: ${name}
Email: ${email}
Message:
${message}
      `.trim();

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #eeeeee;
      padding: 40px 20px;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #93c5fd 0%, #fecaca 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 32px 24px;
      background-color: #ffffff;
    }
    .info-card {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid #93c5fd;
    }
    .info-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #999999;
      margin-bottom: 6px;
    }
    .info-value {
      font-size: 16px;
      color: #333333;
      word-wrap: break-word;
    }
    .info-value a {
      color: #6eb1e7;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .info-value a:hover {
      color: #93c5fd;
      text-decoration: underline;
    }
    .message-card {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      border-left: 4px solid #fecaca;
      margin-top: 20px;
    }
    .message-content {
      font-size: 15px;
      color: #333333;
      line-height: 1.7;
      white-space: pre-wrap;
    }
    .footer {
      padding: 24px;
      text-align: center;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      font-size: 13px;
      color: #999999;
      margin: 0;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
      margin: 24px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 20px 10px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 24px 16px;
      }
      .info-card, .message-card {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <h1>New contact request!</h1>
    </div>
    <div class="content">
      <div class="info-card">
        <div class="info-label">From</div>
        <div class="info-value">${name}</div>
      </div>
      
      <div class="info-card">
        <div class="info-label">Email Address</div>
        <div class="info-value">
          <a href="mailto:${email}">${email}</a>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="message-card">
        <div class="info-label">Message</div>
        <div class="message-content">${message.replace(/\n/g, "<br>")}</div>
      </div>
    </div>
    <div class="footer">
      <p>Sent from borysbabas.dev</p>
    </div>
  </div>
</body>
</html>
      `.trim();

        // Send email using utility function (respects USE_RESEND flag)
        try {
            await sendEmail({
                to: contactEmail,
                subject,
                html,
                text,
                replyTo: email,
            });
            console.log("✅ Contact email sent");
        } catch (emailError: any) {
            console.error("Failed to send contact email:", emailError);

            // In development, save email locally if sending fails
            if (isDevelopment) {
                try {
                    const fs = await import("fs/promises");
                    const path = await import("path");
                    const outDir = path.resolve(process.cwd(), ".local-mails");
                    await fs.mkdir(outDir, {recursive: true});
                    const filename = path.join(outDir, `${Date.now()}-contact.json`);
                    await fs.writeFile(
                        filename,
                        JSON.stringify(
                            {
                                to: contactEmail,
                                replyTo: email,
                                subject,
                                text,
                                html,
                                timestamp: new Date().toISOString(),
                            },
                            null,
                            2,
                        ),
                    );
                    console.log(`   📧 Saved to: ${path.basename(filename)}`);
                } catch (persistErr) {
                    console.error("Failed to persist unsent email locally:", persistErr);
                }
            }
        }

        return {
            success: true,
            message: "Message sent successfully",
        };
    } catch (error: any) {
        console.error("Contact form error:", error);

        // If it's already a formatted error, throw it
        if (error.status || error.statusCode) {
            throw error;
        }

        // Otherwise, create a generic error
        throw createError({
            status: 500,
            message: "Failed to send message. Please try again later.",
        });
    }
});
