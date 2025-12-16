/**
 * Composable for Google reCAPTCHA v2 integration
 */
export const useRecaptcha = () => {
    const config = useRuntimeConfig();
    const siteKey = config.public.recaptchaSiteKey as string;

    /**
     * Load reCAPTCHA script
     */
    const loadRecaptcha = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (typeof window === "undefined") {
                reject(new Error("Window is not defined"));
                return;
            }

            // Check if already loaded
            if (window.grecaptcha) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
            document.head.appendChild(script);
        });
    };

    /**
     * Execute reCAPTCHA and get token
     */
    const executeRecaptcha = async (
        action: string = "submit",
    ): Promise<string> => {
        try {
            await loadRecaptcha();

            return new Promise((resolve, reject) => {
                if (!window.grecaptcha || !window.grecaptcha.ready) {
                    reject(new Error("reCAPTCHA not loaded"));
                    return;
                }

                window.grecaptcha.ready(() => {
                    window.grecaptcha
                        .execute(siteKey, {action})
                        .then((token: string) => resolve(token))
                        .catch((error: Error) => reject(error));
                });
            });
        } catch (error) {
            console.error("reCAPTCHA error:", error);
            throw error;
        }
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
