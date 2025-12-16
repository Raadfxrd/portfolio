import {db} from "~/server/database/client";
import {newsletter} from "~/server/database/schema";
import {eq} from "drizzle-orm";
import {sendEmail, verifyUnsubscribeToken} from "~/server/utils/email";
import {emailTemplates} from "~/server/utils/emailTemplates";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const token = query.token as string;

    if (!token) {
        throw createError({
            statusCode: 400,
            message: "Unsubscribe token is required",
        });
    }

    // Verify and decode the token
    const email = verifyUnsubscribeToken(token);

    if (!email) {
        throw createError({
            statusCode: 400,
            message: "Invalid or expired unsubscribe token",
        });
    }

    // Check if email exists
    const existing = await db
        .select()
        .from(newsletter)
        .where(eq(newsletter.email, email))
        .limit(1);

    if (existing.length === 0) {
        throw createError({
            statusCode: 404,
            message: "Email not found in newsletter list",
        });
    }

    // Check if already unsubscribed
    if (!existing[0]?.active) {
        return {
            success: true,
            message: "Already unsubscribed",
            email,
            alreadyUnsubscribed: true,
        };
    }

    // Deactivate the subscription
    await db
        .update(newsletter)
        .set({active: false})
        .where(eq(newsletter.email, email));

    // Send unsubscribe confirmation email
    try {
        const template = emailTemplates.unsubscribeConfirmation();

        await sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });

        console.log(`✅ Unsubscribe confirmation sent to ${email}`);
    } catch (emailError) {
        console.error("Failed to send unsubscribe confirmation:", emailError);
        // Don't fail the unsubscribe if email fails
    }

    return {
        success: true,
        message: "Successfully unsubscribed from newsletter",
        email,
        alreadyUnsubscribed: false,
    };
});
