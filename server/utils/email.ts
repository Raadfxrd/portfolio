import nodemailer from "nodemailer";
import {Resend} from "resend";
import crypto from "crypto";

/**
 * Get Resend client for production emails
 */
export function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY is not set in environment variables");
    }
    return new Resend(apiKey);
}

/**
 * Get configured email transporter (for development/fallback)
 */
export function getEmailTransporter() {
    const isDevelopment = process.env.NODE_ENV === "development";

    return nodemailer.createTransport({
        host: isDevelopment ? "127.0.0.1" : process.env.SMTP_HOST || "127.0.0.1",
        port: isDevelopment ? 2525 : parseInt(process.env.SMTP_PORT || "587"),
        secure: isDevelopment ? false : process.env.SMTP_SECURE === "true",
        auth: isDevelopment
            ? undefined
            : {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
    });
}

/**
 * Generate unsubscribe token for an email
 */
export function generateUnsubscribeToken(email: string): string {
    const config = useRuntimeConfig();
    const secret = config.jwtSecret || "your-secret-key";
    const hash = crypto
        .createHmac("sha256", secret)
        .update(email.toLowerCase())
        .digest("hex");
    return Buffer.from(`${email}:${hash}`).toString("base64url");
}

/**
 * Verify and decode unsubscribe token
 */
export function verifyUnsubscribeToken(token: string): string | null {
    try {
        const decoded = Buffer.from(token, "base64url").toString("utf-8");
        const [email, hash] = decoded.split(":");

        if (!email || !hash) return null;

        const config = useRuntimeConfig();
        const secret = config.jwtSecret || "your-secret-key";
        const expectedHash = crypto
            .createHmac("sha256", secret)
            .update(email.toLowerCase())
            .digest("hex");

        if (hash === expectedHash) {
            return email;
        }

        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Generate unsubscribe URL
 */
export function getUnsubscribeUrl(email: string): string {
    const token = generateUnsubscribeToken(email);
    const isDevelopment = process.env.NODE_ENV === "development";
    const baseUrl = isDevelopment
        ? "http://localhost:3000"
        : "https://borysbabas.dev";
    return `${baseUrl}/newsletter/unsubscribe?token=${token}`;
}

/**
 * Send email using Resend (production) or nodemailer (development)
 */
export async function sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
}) {
    const useResend = process.env.USE_RESEND === "true";
    const isDevelopment = process.env.NODE_ENV === "development";
    const fromEmail = process.env.SMTP_FROM || "noreply@borysbabas.dev";

    // Use Resend if explicitly enabled (even in development for testing)
    if (useResend) {
        // Use Resend for production or when explicitly enabled
        const resend = getResendClient();

        console.log("📧 Sending email via Resend...");
        console.log(`   From: ${fromEmail}`);
        console.log(`   To: ${options.to}`);
        console.log(`   Subject: ${options.subject}`);
        if (options.replyTo) {
            console.log(`   Reply-To: ${options.replyTo}`);
        }

        try {
            const result = await resend.emails.send({
                from: fromEmail,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                replyTo: options.replyTo,
            });

            console.log("✅ Email sent successfully via Resend!");
            console.log(`   Response:`, result);
            return result;
        } catch (error) {
            console.error("❌ Failed to send email via Resend:", error);
            throw error;
        }
    } else {
        // Use nodemailer for development (Mailpit)
        console.log("📧 Sending email via Mailpit/SMTP...");
        const transporter = getEmailTransporter();

        await transporter.sendMail({
            from: isDevelopment ? "noreply@localhost" : fromEmail,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            replyTo: options.replyTo,
        });

        console.log("✅ Email sent successfully via SMTP!");
    }
}
