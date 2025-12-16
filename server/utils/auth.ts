import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
    userId: number;
    username: string;
}

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(
    password: string,
    hash: string,
): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
}

export async function requireAuth(event: any): Promise<JWTPayload> {
    const token = getCookie(event, "auth_token");

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
