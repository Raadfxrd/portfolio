import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { H3Event } from "h3";

const JWT_EXPIRES_IN = "7d";
const BCRYPT_ROUNDS = 12;

/** Cookie attributes shared by the login and logout handlers. */
export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
} as const;

export interface JWTPayload {
    userId: number;
    username: string;
}

/**
 * Resolve the signing secret.
 *
 * There is deliberately no fallback value: a hardcoded default would let anyone
 * who has read this repository mint valid admin tokens for a deployment that
 * forgot to set JWT_SECRET.
 */
function getJwtSecret(): string {
    const secret = useRuntimeConfig().jwtSecret || process.env.JWT_SECRET;

    if (!secret) {
        throw createError({
            statusCode: 500,
            message: "Server misconfigured: JWT_SECRET is not set",
        });
    }

    return secret;
}

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
    password: string,
    hash: string,
): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, getJwtSecret()) as JWTPayload;
    } catch {
        return null;
    }
}

export async function requireAuth(event: H3Event): Promise<JWTPayload> {
    const token = getCookie(event, AUTH_COOKIE_NAME);

    if (!token) {
        throw createError({
            statusCode: 401,
            message: "Unauthorized - No token provided",
        });
    }

    const payload = verifyToken(token);

    if (!payload) {
        throw createError({
            statusCode: 401,
            message: "Unauthorized - Invalid token",
        });
    }

    return payload;
}

/**
 * Returns the caller's payload, or null when they are not signed in.
 *
 * Use this instead of try/catch around requireAuth when "not logged in" is a
 * normal outcome rather than an error, so a genuine 500 (e.g. a missing
 * JWT_SECRET) is not silently swallowed into "anonymous".
 */
export function getAuthUser(event: H3Event): JWTPayload | null {
    const token = getCookie(event, AUTH_COOKIE_NAME);
    return token ? verifyToken(token) : null;
}
