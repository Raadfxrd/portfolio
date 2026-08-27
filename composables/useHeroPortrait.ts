/**
 * How far the hero portrait has flown into the navbar's logo slot.
 *
 * 0 means the portrait is at rest and the navbar avatar is sitting exactly on
 * top of it, scaled up to match; 1 means the flight is complete and the avatar
 * is home at its own size. In between, the avatar stays glued to the portrait
 * vertically while shrinking and sliding toward the header -- so the photograph
 * appears to peel off the page and travel up into the navbar as you scroll.
 * Both are the same image file, which is what lets the handoff read as one
 * object rather than two.
 *
 * The navbar owns the measurement: it has the slot, and it finds the portrait
 * through the `data-hero-portrait` hook. The home page reads this only to fade
 * the original out from under the flyer.
 *
 * `flightActive` is separate on purpose. Progress alone cannot distinguish "the
 * flight finished" from "there is no flight here", and the home page must not
 * fade its portrait out in the second case -- which is every visitor with
 * reduced motion turned on.
 */
export function useHeroPortrait() {
    const flightProgress = useState("hero-flight-progress", () => 1);
    const flightActive = useState("hero-flight-active", () => false);

    return {flightProgress, flightActive};
}
