export const useNewsletter = () => {
    const subscribed = ref(false);
    const loading = ref(false);
    const error = ref("");
    const message = ref("");

    const subscribe = async (email: string, recaptchaToken?: string) => {
        loading.value = true;
        error.value = "";
        message.value = "";

        try {
            const response = await $fetch("/api/newsletter/subscribe", {
                method: "POST",
                body: {
                    email,
                    recaptchaToken,
                },
            });

            subscribed.value = true;
            message.value = response.message || "Successfully subscribed!";

            // Reset success state after 2 seconds
            setTimeout(() => {
                subscribed.value = false;
                message.value = "";
            }, 2000);

            return true;
        } catch (e: any) {
            error.value = e.data?.message || "Failed to subscribe. Please try again.";

            // Reset error state after 2 seconds
            setTimeout(() => {
                error.value = "";
            }, 2000);

            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        subscribed,
        loading,
        error,
        message,
        subscribe,
    };
};
