import { watch } from "vue";
import { useRoute } from "vue-router";

/**
 * Shared navbar visibility state.
 *
 * Backed by useState rather than module-level refs: on the server a module ref
 * is created once per process and therefore shared by every concurrent
 * request, so one visitor's navbar state could bleed into another's rendered
 * HTML. useState scopes the value to the Nuxt app instance instead.
 */
export function useNavbarVisibility() {
    const route = useRoute();

    const isNavbarVisible = useState("navbar-visible", () => false);
    const isAnimationComplete = useState("navbar-animation-complete", () => false);

    // Watch for route changes
    watch(
        () => route.path,
        (newPath) => {
            if (newPath !== "/") return;

            // The navbar is only pulled down for the intro sequence, which
            // plays once per browser and reveals it on the way out.
            //
            // This used to fire on every arrival at the home page, intro or
            // not. Clicking the logo to come home therefore tore the navbar
            // out of the document and rebuilt it a page transition later --
            // it visibly vanished and came back, taking the logo with it.
            if (
                import.meta.client &&
                localStorage.getItem("hasPlayedIntro") === "true"
            ) {
                return;
            }

            isNavbarVisible.value = false;
            isAnimationComplete.value = false;
        },
        { immediate: true },
    );

    onMounted(() => {
        const hasPlayedIntro = localStorage.getItem("hasPlayedIntro");

        // If not on home page or intro was played before, show navbar
        if (route.path !== "/" || hasPlayedIntro === "true") {
            isNavbarVisible.value = true;
            isAnimationComplete.value = true;
        }
    });

    return {
        isNavbarVisible,
        isAnimationComplete,
        showNavbar: () => {
            isNavbarVisible.value = true;
            isAnimationComplete.value = true;
        },
    };
}
