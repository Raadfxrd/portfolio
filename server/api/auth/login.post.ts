import { db } from "~/server/database/client";
import { users } from "~/server/database/schema";
import {
    AUTH_COOKIE_NAME,
    AUTH_COOKIE_OPTIONS,
    generateToken,
    hashPassword,
    verifyPassword,
} from "~/server/utils/auth";
import { rateLimit } from "~/server/utils/rateLimit";
import { eq } from "drizzle-orm";

/**
 * Compared against when the username does not exist, so that a miss costs the
 * same bcrypt work as a hit and cannot be distinguished by response time.
 */
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash() {
    dummyHashPromise ??= hashPassword("invalid-password-placeholder");
    return dummyHashPromise;
}

export default defineEventHandler(async (event) => {
    // 10 attempts per 15 minutes per IP.
    rateLimit(event, { key: "login", limit: 10, windowMs: 15 * 60 * 1000 });

    const body = await readBody(event);
    const username = typeof body?.username === "string" ? body.username : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
        throw createError({
            statusCode: 400,
            message: "Username and password are required",
        });
    }

    // Find user
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

    // Verify password. Always run a comparison, even for an unknown username,
    // so the two cases are not separable by timing.
    const isValid = await verifyPassword(
        password,
        user?.password ?? (await getDummyHash()),
    );

    if (!user || !isValid) {
        throw createError({
            statusCode: 401,
            message: "Invalid credentials",
        });
    }

    // Generate token
    const token = generateToken({
        userId: user.id,
        username: user.username,
    });

    // Set cookie
    setCookie(event, AUTH_COOKIE_NAME, token, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
        success: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    };
});
