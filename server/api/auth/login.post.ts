import {db} from "~/server/database/client";
import {users} from "~/server/database/schema";
import {generateToken, verifyPassword} from "~/server/utils/auth";
import {eq} from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const {username, password} = body;

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

    if (!user) {
        throw createError({
            statusCode: 401,
            message: "Invalid credentials",
        });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
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
    setCookie(event, "auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
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
