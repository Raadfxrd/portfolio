import { db } from "~/server/database/client";
import { newsletter } from "~/server/database/schema";
import { resolveUnsubscribeToken } from "~/server/utils/newsletter";

/**
 * Read-only lookup behind the unsubscribe page.
 *
 * This endpoint deliberately does not mutate. It previously performed the
 * unsubscribe itself, which meant anything that merely *fetched* the URL —
 * a mail client prefetching links, a security scanner, a chat app building a
 * preview — silently unsubscribed the recipient without them ever clicking.
 * The state change now lives in the POST handler.
 */
export default defineEventHandler(async (event) => {
    const { email, match } = resolveUnsubscribeToken(getQuery(event).token);

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

    return {
        email,
        alreadyUnsubscribed: !subscriber.active,
    };
});
