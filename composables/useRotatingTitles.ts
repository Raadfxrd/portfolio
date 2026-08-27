import {onMounted, onUnmounted} from "vue";

const TITLES = [
    "Frontend Developer,",
    "Full-Stack Developer,",
    "Web Developer,",
    "Software Engineer,",
];

const ROTATE_MS = 4000;

/** Glyphs the text churns through before each character settles. */
const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#";

/** Frames a character spends unsettled, and how far apart they start landing. */
const SCRAMBLE_FRAMES = 18;
const SETTLE_STAGGER = 2;

// Module scope, and therefore one set of timers per browser tab. They are only
// ever created from onMounted, which does not run on the server, so this never
// becomes state shared between requests.
let rotateTimer: ReturnType<typeof setInterval> | null = null;
let animationFrame: number | null = null;
let subscribers = 0;

const randomGlyph = () =>
    SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];

const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The rotating job title under the greeting.
 *
 * The values live in `useState` rather than local refs because the composable
 * is called from more than one place. Each call used to build its own refs and
 * start its own interval, so the page ran several rotations at once and only
 * one of them was ever on screen. None of them were cleaned up either --
 * `onMounted` ignores a returned teardown function, so the intervals kept
 * firing long after navigating away from the home page.
 *
 * Titles now decode into place character by character rather than crossfading.
 * The home page renders this in a full-width box: the scrambled glyphs are not
 * the same width as the letters they stand in for, and in a `w-fit` box that
 * reflowed the line on every frame.
 */
export function useRotatingTitles() {
    const index = useState("rotating-title-index", () => 0);
    const currentTitle = useState("rotating-title", () => TITLES[0]);

    const stop = () => {
        if (rotateTimer) clearInterval(rotateTimer);
        if (animationFrame) cancelAnimationFrame(animationFrame);
        rotateTimer = null;
        animationFrame = null;
    };

    /** Churn each position through random glyphs until its own settle frame. */
    const scrambleTo = (next: string) => {
        const previous = currentTitle.value;
        const length = Math.max(previous.length, next.length);

        const positions = Array.from({length}, (_, i) => ({
            from: previous[i] ?? "",
            to: next[i] ?? "",
            settlesAt: SCRAMBLE_FRAMES + i * SETTLE_STAGGER,
        }));

        let frame = 0;

        const tick = () => {
            let output = "";
            let settled = 0;

            for (const position of positions) {
                if (frame >= position.settlesAt) {
                    output += position.to;
                    settled += 1;
                } else if (frame >= position.settlesAt - SCRAMBLE_FRAMES) {
                    output += position.to === " " ? " " : randomGlyph();
                } else {
                    output += position.from;
                }
            }

            currentTitle.value = output;

            if (settled === positions.length) {
                animationFrame = null;
                return;
            }

            frame += 1;
            animationFrame = requestAnimationFrame(tick);
        };

        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(tick);
    };

    const advance = () => {
        index.value = (index.value + 1) % TITLES.length;
        const next = TITLES[index.value];

        // Reduced motion gets the title, not the theatre.
        if (prefersReducedMotion()) {
            currentTitle.value = next;
            return;
        }

        scrambleTo(next);
    };

    const start = () => {
        if (rotateTimer) return;

        // Note that the first title is no longer skipped: rotation used to fire
        // once immediately, so "Frontend Developer," started decoding away the
        // instant it appeared and never got its four seconds.
        rotateTimer = setInterval(advance, ROTATE_MS);
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
            // Leave a real title behind rather than a half-decoded one.
            currentTitle.value = TITLES[index.value];
        }
    });

    return {currentTitle};
}
