export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip on server
    if (process.server) return;

    try {
        const {authenticated} = await $fetch("/api/auth/me");

        if (!authenticated) {
            return navigateTo("/admin/login");
        }
    } catch (error) {
        return navigateTo("/admin/login");
    }
});
