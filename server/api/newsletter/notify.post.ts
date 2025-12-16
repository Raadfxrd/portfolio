import {db} from "~/server/database/client";
import {newsletter} from "~/server/database/schema";
import {eq} from "drizzle-orm";
import {getUnsubscribeUrl, sendEmail} from "~/server/utils/email";
import {emailTemplates} from "~/server/utils/emailTemplates";

interface NotifySubscribersBody {
    postSlug: string;
    postTitle: string;
    postDescription: string;
}

export default defineEventHandler(async (event) => {
    // Require authentication
    await requireAuth(event);

    const body = await readBody<NotifySubscribersBody>(event);
    const {postSlug, postTitle, postDescription} = body;

    if (!postSlug || !postTitle || !postDescription) {
        throw createError({
            statusCode: 400,
            message: "Post slug, title, and description are required",
        });
    }

    // Get all active subscribers
    const subscribers = await db
        .select()
        .from(newsletter)
        .where(eq(newsletter.active, true));

    if (subscribers.length === 0) {
        return {
            success: true,
            message: "No active subscribers to notify",
            sent: 0,
        };
    }

    console.log(
        `📧 Sending new post notification to ${subscribers.length} subscribers...`,
    );

    // Send emails in batches to avoid overwhelming SMTP server
    const BATCH_SIZE = 10; // Send 10 emails at a time
    const BATCH_DELAY = 5000; // Wait 2 seconds between batches

    let successCount = 0;
    let failureCount = 0;

    // Split subscribers into batches
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const batch = subscribers.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(subscribers.length / BATCH_SIZE);

        console.log(
            `📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)...`,
        );

        // Send emails in parallel within the batch
        const batchPromises = batch.map(async (subscriber) => {
            try {
                const unsubscribeUrl = getUnsubscribeUrl(subscriber.email);
                const template = emailTemplates.newBlogPost(
                    {
                        title: postTitle,
                        description: postDescription,
                        slug: postSlug,
                    },
                    unsubscribeUrl,
                );

                await sendEmail({
                    to: subscriber.email,
                    subject: template.subject,
                    html: template.html,
                    text: template.text,
                });

                console.log(`✅ Email sent to ${subscriber.email}`);
                return {success: true};
            } catch (emailError) {
                console.error(
                    `❌ Failed to send email to ${subscriber.email}:`,
                    emailError,
                );
                return {success: false};
            }
        });

        // Wait for all emails in this batch to complete
        const results = await Promise.allSettled(batchPromises);

        // Count successes and failures
        results.forEach((result) => {
            if (result.status === "fulfilled" && result.value.success) {
                successCount++;
            } else {
                failureCount++;
            }
        });

        // Wait before processing next batch (unless it's the last batch)
        if (i + BATCH_SIZE < subscribers.length) {
            console.log(
                `⏳ Waiting ${BATCH_DELAY / 1000} seconds before next batch...`,
            );
            await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        }
    }

    console.log(
        `📧 Notification complete: ${successCount} sent, ${failureCount} failed`,
    );

    return {
        success: true,
        message: `Notifications sent to ${successCount} subscribers`,
        sent: successCount,
        failed: failureCount,
        total: subscribers.length,
    };
});
