interface RecaptchaResponse {
    success: boolean;
    score?: number;
    action?: string;
    challenge_ts?: string;
    hostname?: string;
    "error-codes"?: string[];
}

interface VerifyRecaptchaOptions {
    token: string;
    minScore?: number;
    expectedAction?: string;
}

/**
 * Verify a reCAPTCHA token with Google's API
 * @param options Verification options including token and optional score/action checks
 * @returns Promise<boolean> True if verification passes
 * @throws Error if verification fails
 */
export async function verifyRecaptcha(
    options: VerifyRecaptchaOptions,
): Promise<boolean> {
    const config = useRuntimeConfig();
    const recaptchaSecretKey = config.recaptchaSecretKey;

    // Skip in development if SKIP_RECAPTCHA is set
    const shouldSkipRecaptcha = process.env.SKIP_RECAPTCHA === "true";

    if (shouldSkipRecaptcha) {
        console.log("⚠️  Skipping reCAPTCHA verification (SKIP_RECAPTCHA=true)");
        return true;
    }

    // Check if secret key is configured
    if (!recaptchaSecretKey) {
        console.error("❌ NUXT_RECAPTCHA_SECRET_KEY is not configured");
        throw createError({
            statusCode: 500,
            message: "reCAPTCHA is not configured on the server",
        });
    }

    // Check if token is provided
    if (!options.token) {
        throw createError({
            statusCode: 400,
            message: "reCAPTCHA token is required",
        });
    }

    try {
        console.log("🔐 Verifying reCAPTCHA token...");

        const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
        const verifyResponse = await $fetch<RecaptchaResponse>(verifyUrl, {
            method: "POST",
            body: new URLSearchParams({
                secret: recaptchaSecretKey,
                response: options.token,
            }),
        });

        console.log("reCAPTCHA verification result:", {
            success: verifyResponse.success,
            score: verifyResponse.score,
            action: verifyResponse.action,
        });

        // Check if verification succeeded
        if (!verifyResponse.success) {
            const errorCodes = verifyResponse["error-codes"] || [];
            console.error("❌ reCAPTCHA verification failed:", errorCodes);

            // Provide helpful error messages
            if (errorCodes.includes("invalid-input-secret")) {
                console.error(
                    "💡 Your NUXT_RECAPTCHA_SECRET_KEY is invalid. Get the correct key from https://www.google.com/recaptcha/admin",
                );
            } else if (errorCodes.includes("invalid-input-response")) {
                console.error(
                    "💡 The reCAPTCHA token is invalid, expired, or doesn't match your site key",
                );
            } else if (errorCodes.includes("timeout-or-duplicate")) {
                console.error("💡 The reCAPTCHA token has expired or was already used");
            }

            throw createError({
                statusCode: 400,
                message: "reCAPTCHA verification failed",
            });
        }

        // Check score if provided (for v3)
        if (options.minScore !== undefined && verifyResponse.score !== undefined) {
            if (verifyResponse.score < options.minScore) {
                console.error(
                    `❌ reCAPTCHA score too low: ${verifyResponse.score} < ${options.minScore}`,
                );
                throw createError({
                    statusCode: 400,
                    message:
                        "reCAPTCHA verification failed - suspicious activity detected",
                });
            }
        }

        // Check action if provided (for v3)
        if (options.expectedAction) {
            if (verifyResponse.action === undefined) {
                // Google did not return an action. This can happen for v2 tokens or if the
                // site/secret keys are misconfigured (or using an older reCAPTCHA type).
                // Log a helpful warning but don't immediately fail here — fall back to
                // allowing verification to pass if the response.success is true.
                console.warn(
                    `⚠️ reCAPTCHA response has no action field. Expected action: "${options.expectedAction}". This may indicate a v2 token or misconfigured site/secret keys.`,
                );
            } else if (verifyResponse.action !== options.expectedAction) {
                console.error(
                    `❌ reCAPTCHA action mismatch: expected "${options.expectedAction}", got "${verifyResponse.action}"`,
                );
                throw createError({
                    statusCode: 400,
                    message: "reCAPTCHA verification failed - action mismatch",
                });
            }
        }

        console.log("✅ reCAPTCHA verification passed");
        return true;
    } catch (error: any) {
        // Re-throw createError errors
        if (error.statusCode) {
            throw error;
        }

        // Log and throw network/other errors
        console.error("❌ reCAPTCHA verification error:", error);
        throw createError({
            statusCode: 500,
            message: "Failed to verify reCAPTCHA",
        });
    }
}
