import { onMounted } from "vue";

function greetingForHour(hour: number): string {
    if (hour < 12) return "Good morning,";
    if (hour < 18) return "Good afternoon,";
    return "Good evening,";
}

/**
 * Time-of-day greeting.
 *
 * The value is seeded on the server and carried to the client through the Nuxt
 * payload, so hydration sees identical markup. It is then corrected on mount
 * using the visitor's own clock — previously the greeting was computed from
 * `new Date()` during render, which used the *server's* timezone and produced a
 * hydration mismatch whenever the two disagreed.
 */
export function useGreeting() {
    const greeting = useState("greeting", () =>
        greetingForHour(new Date().getHours()),
    );

    onMounted(() => {
        greeting.value = greetingForHour(new Date().getHours());
    });

    return { greeting };
}
