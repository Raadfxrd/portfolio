import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: "2025-12-09",
    devtools: {enabled: process.env.NODE_ENV !== "production"},

    app: {
        pageTransition: {
            name: "page",
            mode: "out-in",
        },
        head: {
            title: "borysbabas.dev",
            meta: [
                {
                    name: "description",
                    content: "borysbabas.dev, Borys' personal portfolio.",
                },
                {name: "viewport", content: "width=device-width, initial-scale=1"},
            ],
            link: [
                // Warm up the icon CDN connection before the stylesheet request lands.
                {rel: "preconnect", href: "https://cdn.jsdelivr.net", crossorigin: ""},
                {
                    rel: "stylesheet",
                    type: "text/css",
                    // Pinned: `@latest` re-resolves on every request and can change without notice.
                    href: "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/devicon.min.css",
                },
            ],
        },
    },

    css: ["/assets/css/main.css"],

    routeRules: {
        // /services is gone -- this stays a portfolio. Redirect rather than
        // 404 so existing links and indexed results land somewhere useful.
        "/services": {redirect: {to: "/", statusCode: 301}},
    },

    vite: {
        plugins: [tailwindcss()],
    },

    modules: ["@nuxtjs/color-mode"],

    colorMode: {
        preference: "system", // default value if no preference is stored
        fallback: "dark", // fallback value if system can't be detected
        classSuffix: "", // Important for Tailwind's 'dark' class
        storageKey: "theme",
    },

    runtimeConfig: {
        // Private keys (server-side only)
        databaseUrl: process.env.DATABASE_URL || "",
        recaptchaSecretKey: process.env.NUXT_RECAPTCHA_SECRET_KEY || "",
        githubToken: process.env.GITHUB_TOKEN || "",
        jwtSecret: process.env.JWT_SECRET || "",
        resendApiKey: process.env.RESEND_API_KEY || "",
        useResend: process.env.USE_RESEND === "true",
        smtpHost: process.env.SMTP_HOST || "127.0.0.1",
        smtpPort: Number(process.env.SMTP_PORT) || 2525,
        smtpSecure: process.env.SMTP_SECURE === "true",
        smtpUser: process.env.SMTP_USER || "",
        smtpPass: process.env.SMTP_PASS || "",
        smtpFrom: process.env.SMTP_FROM || "noreply@borysbabas.dev",
        contactEmail: process.env.CONTACT_EMAIL || "info@borysbabas.dev",

        // Public keys (exposed to client)
        public: {
            recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://borysbabas.dev",
        },
    },
});
