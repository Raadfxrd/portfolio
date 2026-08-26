export default defineNuxtRouteMiddleware(async () => {
    // `process.server` was removed in Nuxt 4; the tree-shaken flag is
    // `import.meta.server`. The old check silently evaluated to undefined,
    // so this ran on the server too and fired a cookie-less /api/auth/me.
    if (import.meta.server) return;

    try {
        const { authenticated } = await $fetch("/api/auth/me");

        if (!authenticated) {
            return navigateTo("/admin/login");
        }
    } catch {
        return navigateTo("/admin/login");
    }
});
