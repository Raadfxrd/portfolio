import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-12-09",
  devtools: { enabled: true },

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
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        {
          rel: "stylesheet",
          type: "text/css",
          href: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css",
        },
      ],
    },
  },

  css: ["/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ["@nuxtjs/color-mode", "@nuxt/content"],

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
    jwtSecret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-this-in-production",
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
    resendApiKey: process.env.RESEND_API_KEY || "",
    useResend: process.env.USE_RESEND === "true",
    smtpHost: process.env.SMTP_HOST || "127.0.0.1",
    smtpPort: parseInt(process.env.SMTP_PORT || "2525"),
    smtpFrom: process.env.SMTP_FROM || "noreply@borysbabas.dev",
    contactEmail: process.env.CONTACT_EMAIL || "borysbabas@pm.me",

    // Public keys (exposed to client)
    public: {
      githubToken: process.env.NUXT_PUBLIC_GITHUB_TOKEN || "",
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseKey: process.env.SUPABASE_ANON_KEY || "",
    },
  },
});
