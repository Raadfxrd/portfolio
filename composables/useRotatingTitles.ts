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

export interface TitleChar {
    char: string;
    /** True while this position is still churning, which is what carries the blur. */
    scrambling: boolean;
}

const toChars = (text: string): TitleChar[] =>
    Array.from(text, (char) => ({char, scrambling: false}));

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
 * Titles decode into place character by character rather than crossfading, and
 * the text is exposed per character rather than as one string so each position
 * can carry its own blur while it churns -- the decode reads as a wave passing
 * across the line, sharpening behind itself.
 */
export function useRotatingTitles() {
    const index = useState("rotating-title-index", () => 0);
    const titleChars = useState<TitleChar[]>("rotating-title-chars", () =>
        toChars(TITLES[0]),
    );

    const stop = () => {
        if (rotateTimer) clearInterval(rotateTimer);
        if (animationFrame) cancelAnimationFrame(animationFrame);
        rotateTimer = null;
        animationFrame = null;
    };

    /** Churn each position through random glyphs until its own settle frame. */
    const scrambleTo = (next: string) => {
        const previous = titleChars.value.map((entry) => entry.char).join("");
        const length = Math.max(previous.length, next.length);

        const positions = Array.from({length}, (_, i) => ({
            from: previous[i] ?? "",
            to: next[i] ?? "",
            settlesAt: SCRAMBLE_FRAMES + i * SETTLE_STAGGER,
        }));

        let frame = 0;

        const tick = () => {
            const output: TitleChar[] = [];
            let settled = 0;

            for (const position of positions) {
                if (frame >= position.settlesAt) {
                    output.push({char: position.to, scrambling: false});
                    settled += 1;
                } else if (frame >= position.settlesAt - SCRAMBLE_FRAMES) {
                    // Spaces are held: a glyph appearing in the gap between two
                    // words reads as a typo rather than as decoding.
                    output.push(
                        position.to === " "
                            ? {char: " ", scrambling: false}
                            : {char: randomGlyph(), scrambling: true},
                    );
                } else {
                    output.push({char: position.from, scrambling: false});
                }
            }

            titleChars.value = output;

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
            titleChars.value = toChars(next);
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
            titleChars.value = toChars(TITLES[index.value]);
        }
    });

    return {titleChars};
}
