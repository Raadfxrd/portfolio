/**
 * Composable for Google reCAPTCHA v3 integration
 */

/**
 * Shared across every caller: the loader used to check `window.grecaptcha`
 * and, finding it not yet set, append another <script> tag. Two concurrent
 * callers (the contact form and the newsletter form on the same page) each
 * injected their own copy. Caching the promise makes the load happen once.
 */
let recaptchaPromise: Promise<void> | null = null;

export const useRecaptcha = () => {
    const config = useRuntimeConfig();
    const siteKey = config.public.recaptchaSiteKey as string;

    /**
     * Load reCAPTCHA script
     */
    const loadRecaptcha = (): Promise<void> => {
        if (typeof window === "undefined") {
            return Promise.reject(new Error("Window is not defined"));
        }

        if (!siteKey) {
            return Promise.reject(new Error("reCAPTCHA site key is not configured"));
        }

        if (window.grecaptcha) return Promise.resolve();

        recaptchaPromise ??= new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => {
                // Let a later attempt retry rather than caching the failure.
                recaptchaPromise = null;
                reject(new Error("Failed to load reCAPTCHA"));
            };
            document.head.appendChild(script);
        });

        return recaptchaPromise;
    };

    /**
     * Execute reCAPTCHA and get token
     */
    const executeRecaptcha = async (
        action: string = "submit",
    ): Promise<string> => {
        await loadRecaptcha();

        return new Promise((resolve, reject) => {
            if (!window.grecaptcha?.ready) {
                reject(new Error("reCAPTCHA not loaded"));
                return;
            }

            window.grecaptcha.ready(() => {
                window.grecaptcha
                    .execute(siteKey, {action})
                    .then(resolve)
                    .catch(reject);
            });
        });
    };

    return {
        loadRecaptcha,
        executeRecaptcha,
    };
};

declare global {
    interface Window {
        grecaptcha: {
            ready: (callback: () => void) => void;
            execute: (
                siteKey: string,
                options: { action: string },
            ) => Promise<string>;
            render: (
                container: HTMLElement,
                params: {
                    sitekey: string;
                    theme?: string;
                    size?: string;
                },
            ) => number;
            getResponse: (widgetId: number) => string;
            reset: (widgetId: number) => void;
        };
    }
}
