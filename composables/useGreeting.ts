import { computed, onMounted } from "vue";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}

/**
 * The two ends of the `.gradient` sweep, kept in step with the stylesheet.
 *
 * The greeting cannot use that class. Every letter is its own element carrying
 * a reveal animation, and a transformed, composited descendant of an element
 * clipping its background to text drops out of the clip in WebKit -- it is
 * painted with `-webkit-text-fill-color: transparent` and no background of its
 * own behind it, which is to say invisible. That is why the greeting was there
 * on desktop and missing on iPhones: the other gradient headings on the page
 * animate the gradient element itself and so are unaffected.
 *
 * Interpolating a flat colour per letter reads the same at a glance -- the
 * sweep is horizontal and the phrase is one line -- and needs no clipping.
 */
const GRADIENT_FROM = [0x93, 0xc5, 0xfd];
const GRADIENT_TO = [0xfe, 0xca, 0xca];

function colourAt(t: number): string {
  const channels = GRADIENT_FROM.map((from, i) =>
    Math.round(from + (GRADIENT_TO[i] - from) * t),
  );

  return `rgb(${channels.join(", ")})`;
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

  /**
   * The greeting split for the staggered reveal: words so the line can wrap
   * between them, letters so each can arrive on its own beat, and a colour
   * per letter taken from its position across the whole phrase.
   */
  const greetingWords = computed(() => {
    const words = greeting.value.split(" ");
    const lastLetter = Math.max(
      words.reduce((count, word) => count + word.length, 0) - 1,
      1,
    );
    let position = 0;

    return words.map((word, wordIndex) => ({
      letters: [...word].map((char, letterIndex) => ({
        char,
        colour: colourAt(position++ / lastLetter),
        delay: `${wordIndex * 600 + letterIndex * 50}ms`,
      })),
    }));
  });

  return { greeting, greetingWords };
}
