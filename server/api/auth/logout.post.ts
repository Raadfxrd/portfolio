import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
    // The clearing cookie must carry the same attributes it was set with,
    // otherwise the browser treats it as a different cookie and the session
    // survives the logout.
    deleteCookie(event, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);

    return {
        success: true,
        message: "Logged out successfully",
    };
});
