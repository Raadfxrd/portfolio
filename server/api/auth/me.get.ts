import {requireAuth} from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
    try {
        const user = await requireAuth(event);
        return {
            authenticated: true,
            user,
        };
    } catch (error) {
        return {
            authenticated: false,
        };
    }
});
