import {db} from "~/server/database/client";
import {newsletter} from "~/server/database/schema";
import {eq} from "drizzle-orm";
import {getUnsubscribeUrl, sendEmail} from "~/server/utils/email";
import {emailTemplates} from "~/server/utils/emailTemplates";
import {verifyRecaptcha} from "~/server/utils/recaptcha";

interface NewsletterSubscribeBody {
    email: string;
    recaptchaToken?: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<NewsletterSubscribeBody>(event);
    const {email, recaptchaToken} = body;

    if (!email) {
        throw createError({
            statusCode: 400,
            message: "Email is required",
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw createError({
            statusCode: 400,
            message: "Invalid email format",
        });
    }

    // Verify reCAPTCHA token
    if (recaptchaToken) {
        await verifyRecaptcha({
            token: recaptchaToken,
            minScore: 0.5, // Require at least 0.5 score for newsletter
            expectedAction: "subscribe_newsletter", // Verify the action matches
        });
    } else {
        // In production, require reCAPTCHA token
        const isDevelopment = process.env.NODE_ENV === "development";
        const shouldSkipRecaptcha = process.env.SKIP_RECAPTCHA === "true";

        if (!isDevelopment && !shouldSkipRecaptcha) {
            throw createError({
                statusCode: 400,
                message: "reCAPTCHA token is required",
            });
        }
    }

    // Check if email already exists
    const existing = await db
        .select()
        .from(newsletter)
        .where(eq(newsletter.email, email))
        .limit(1);

    if (existing.length > 0 && existing[0]) {
        // Reactivate if inactive
        if (!existing[0].active) {
            await db
                .update(newsletter)
                .set({active: true, subscribedAt: new Date()})
                .where(eq(newsletter.email, email));

            return {
                success: true,
                message: "Subscription reactivated successfully",
            };
        }

        return {
            success: true,
            message: "Email is already subscribed",
        };
    }

    // Add new subscriber
    await db.insert(newsletter).values({
        email,
        active: true,
    });

    // Send confirmation email
    try {
        const unsubscribeUrl = getUnsubscribeUrl(email);
        const template = emailTemplates.subscriptionConfirmation(unsubscribeUrl);

        await sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });

        console.log(`✅ Confirmation email sent to ${email}`);
    } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the subscription if email fails
    }

    return {
        success: true,
        message: "Successfully subscribed to newsletter",
    };
});
