import {onMounted, onUnmounted} from "vue";

const TITLES = [
    "Frontend Developer,",
    "Full-Stack Developer,",
    "Web Developer,",
    "Software Engineer,",
];

const ROTATE_MS = 4000;
const FADE_MS = 500;

// Module scope, and therefore one set of timers per browser tab. They are only
// ever created from onMounted, which does not run on the server, so this never
// becomes state shared between requests.
let rotateTimer: ReturnType<typeof setInterval> | null = null;
let fadeTimer: ReturnType<typeof setTimeout> | null = null;
let subscribers = 0;

/**
 * The rotating job title under the greeting.
 *
 * The values live in `useState` rather than local refs because the composable
 * is called from more than one place. Each call used to build its own refs and
 * start its own interval, so the page ran several rotations at once and only
 * one of them was ever on screen. None of them were cleaned up either --
 * `onMounted` ignores a returned teardown function, so the intervals kept
 * firing long after navigating away from the home page.
 */
export function useRotatingTitles() {
    const index = useState("rotating-title-index", () => 0);
    const currentTitle = useState("rotating-title", () => TITLES[0]);
    const isFadingOut = useState("rotating-title-fading", () => false);

    const stop = () => {
        if (rotateTimer) clearInterval(rotateTimer);
        if (fadeTimer) clearTimeout(fadeTimer);
        rotateTimer = null;
        fadeTimer = null;
        isFadingOut.value = false;
    };

    const start = () => {
        if (rotateTimer) return;

        // Note that the first title is no longer skipped: rotation used to fire
        // once immediately, so "Frontend Developer," started fading out the
        // instant it appeared and never got its four seconds.
        rotateTimer = setInterval(() => {
            isFadingOut.value = true;

            fadeTimer = setTimeout(() => {
                index.value = (index.value + 1) % TITLES.length;
                currentTitle.value = TITLES[index.value];
                isFadingOut.value = false;
            }, FADE_MS);
        }, ROTATE_MS);
    };

    // Reference counted: the last component to leave turns the timers off, and
    // one caller unmounting does not stop another caller's rotation.
    onMounted(() => {
        subscribers += 1;
        start();
    });

    onUnmounted(() => {
        subscribers -= 1;
        if (subscribers <= 0) {
            subscribers = 0;
            stop();
        }
    });

    return {currentTitle, isFadingOut};
}
