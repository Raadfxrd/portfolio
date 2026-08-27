import {onMounted, ref} from "vue";
import {useNavbarVisibility} from "~/composables/useNavbarVisibility";

export function useIntroSequence() {
    const showIntro = ref(false);
    const showContent = ref(false);

    const {showNavbar} = useNavbarVisibility();

    onMounted(() => {
        if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
            const hasPlayedIntro = localStorage.getItem("hasPlayedIntro");

            // Only play the intro sequence if it hasn't been played before
            if (!hasPlayedIntro) {
                showIntro.value = true;

                setTimeout(() => {
                    showIntro.value = false;
                    showContent.value = true;
                    showNavbar?.();
                    localStorage.setItem("hasPlayedIntro", "true");
                }, 1000);
            } else {
                // Skip intro and directly show content
                showContent.value = true;
                showNavbar?.();
            }
        } else {
            // Fallback for environments without localStorage
            showContent.value = true;
            showNavbar?.();
        }
    });

    return {
        showIntro,
        showContent,
    };
}
