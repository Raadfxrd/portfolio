import { newsletter } from "~/server/database/schema";
import { sql } from "drizzle-orm";
import { verifyUnsubscribeToken } from "~/server/utils/email";

/**
 * Turn an unsubscribe token into the address it authorises, plus a WHERE
 * clause that matches that address.
 *
 * Matching is case-insensitive: tokens issued before addresses were normalised
 * still carry the original casing.
 */
export function resolveUnsubscribeToken(token: unknown) {
    if (typeof token !== "string" || !token) {
        throw createError({
            statusCode: 400,
            message: "Unsubscribe token is required",
        });
    }

    const email = verifyUnsubscribeToken(token);

    if (!email) {
        throw createError({
            statusCode: 400,
            message: "Invalid or expired unsubscribe token",
        });
    }

    return {
        email,
        match: sql`lower(${newsletter.email}) = ${email.toLowerCase()}`,
    };
}
