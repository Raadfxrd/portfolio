/**
 * How much the navbar logo should stand in for the hero portrait.
 *
 * 0 means the big portrait owns the screen and the navbar avatar stays out of
 * the way; 1 means the portrait has scrolled off and the avatar has taken its
 * place. The home page scrubs this from the portrait's intersection ratio, so
 * the small logo grows in step with the large one leaving rather than snapping
 * at a threshold.
 *
 * Pages without a hero portrait never touch it, so it sits at 1 and the logo is
 * simply visible -- which is also the server-rendered default, so the navbar
 * never hydrates into a hidden logo.
 */
export function useHeroPortrait() {
    const logoReveal = useState("hero-logo-reveal", () => 1);

    return {logoReveal};
}
