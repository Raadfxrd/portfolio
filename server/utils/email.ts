import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import crypto from "crypto";

let _resend: Resend | null = null;
let _transporter: Transporter | null = null;

/**
 * Get Resend client for production emails
 */
export function getResendClient() {
    if (_resend) return _resend;

    const apiKey = useRuntimeConfig().resendApiKey || process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY is not set in environment variables");
    }

    _resend = new Resend(apiKey);
    return _resend;
}

/**
 * Get configured email transporter (for development/fallback).
 *
 * Cached and pooled: the newsletter blast previously built a fresh transporter
 * (and therefore a fresh SMTP connection) for every single recipient.
 */
export function getEmailTransporter(): Transporter {
    if (_transporter) return _transporter;

    const config = useRuntimeConfig();
    const isDevelopment = process.env.NODE_ENV === "development";

    _transporter = nodemailer.createTransport({
        pool: true,
        maxConnections: 3,
        host: isDevelopment ? "127.0.0.1" : config.smtpHost,
        port: isDevelopment ? 2525 : config.smtpPort,
        secure: isDevelopment ? false : config.smtpSecure,
        auth:
            isDevelopment || !config.smtpUser
                ? undefined
                : {
                      user: config.smtpUser,
                      pass: config.smtpPass,
                  },
    });

    return _transporter;
}

function getUnsubscribeSecret(): string {
    const secret = useRuntimeConfig().jwtSecret || process.env.JWT_SECRET;

    // No fallback: a default secret would let anyone forge a token that
    // unsubscribes any address they choose.
    if (!secret) {
        throw new Error(
            "JWT_SECRET is not set; unsubscribe links cannot be signed",
        );
    }

    return secret;
}

function signEmail(email: string): string {
    return crypto
        .createHmac("sha256", getUnsubscribeSecret())
        .update(email.toLowerCase())
        .digest("hex");
}

/**
 * Generate unsubscribe token for an email
 */
export function generateUnsubscribeToken(email: string): string {
    return Buffer.from(`${email}:${signEmail(email)}`).toString("base64url");
}

/**
 * Verify and decode unsubscribe token
 */
export function verifyUnsubscribeToken(token: string): string | null {
    try {
        const decoded = Buffer.from(token, "base64url").toString("utf-8");

        // Split on the last colon: an email address cannot contain one, but
        // splitting on the first would mangle any future format change.
        const separator = decoded.lastIndexOf(":");
        if (separator === -1) return null;

        const email = decoded.slice(0, separator);
        const hash = decoded.slice(separator + 1);
        if (!email || !hash) return null;

        const expected = signEmail(email);

        // Constant-time compare so the valid digest cannot be recovered byte by
        // byte from response timing. timingSafeEqual throws on length mismatch.
        const provided = Buffer.from(hash, "utf-8");
        const expectedBuf = Buffer.from(expected, "utf-8");
        if (provided.length !== expectedBuf.length) return null;

        return crypto.timingSafeEqual(provided, expectedBuf) ? email : null;
    } catch {
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
        : useRuntimeConfig().public.siteUrl;

    return `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
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
    const config = useRuntimeConfig();
    const useResend = config.useResend;
    const isDevelopment = process.env.NODE_ENV === "development";
    const fromEmail = config.smtpFrom;

    // Use Resend if explicitly enabled (even in development for testing)
    if (useResend) {
        const resend = getResendClient();

        console.log(`📧 Sending email via Resend to ${options.to}`);

        const result = await resend.emails.send({
            from: fromEmail,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            replyTo: options.replyTo,
        });

        // The SDK reports delivery failures in the payload rather than by
        // throwing, so an unchecked call here silently "succeeded".
        if (result.error) {
            console.error("❌ Failed to send email via Resend:", result.error);
            throw new Error(result.error.message || "Resend rejected the email");
        }

        console.log("✅ Email sent successfully via Resend!");
        return result;
    }

    // Use nodemailer for development (Mailpit)
    console.log(`📧 Sending email via Mailpit/SMTP to ${options.to}`);

    await getEmailTransporter().sendMail({
        from: isDevelopment ? "noreply@localhost" : fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
    });

    console.log("✅ Email sent successfully via SMTP!");
}
