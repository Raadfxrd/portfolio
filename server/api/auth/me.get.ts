import { getAuthUser } from "~/server/utils/auth";

export default defineEventHandler((event) => {
    const user = getAuthUser(event);

    return user ? { authenticated: true, user } : { authenticated: false };
});
