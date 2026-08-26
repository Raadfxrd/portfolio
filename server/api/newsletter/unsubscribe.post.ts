import { db } from "~/server/database/client";
import { newsletter } from "~/server/database/schema";
import { sendEmail } from "~/server/utils/email";
import { emailTemplates } from "~/server/utils/emailTemplates";
import { resolveUnsubscribeToken } from "~/server/utils/newsletter";

/**
 * Perform the unsubscribe.
 *
 * Deliberately a POST: this is the state-changing half of the flow, so it only
 * runs when the recipient actually confirms on the page, never as a side
 * effect of something fetching the link.
 */
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { email, match } = resolveUnsubscribeToken(body?.token);

    const [subscriber] = await db
        .select({ active: newsletter.active })
        .from(newsletter)
        .where(match)
        .limit(1);

    if (!subscriber) {
        throw createError({
            statusCode: 404,
            message: "Email not found in newsletter list",
        });
    }

    // Already unsubscribed: report success rather than erroring, so a repeated
    // confirmation is harmless.
    if (!subscriber.active) {
        return {
            success: true,
            message: "Already unsubscribed",
            email,
            alreadyUnsubscribed: true,
        };
    }

    await db.update(newsletter).set({ active: false }).where(match);

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
