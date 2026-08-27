export interface NavLink {
    path: string;
    label: string;
}

/**
 * The primary navigation, in one place.
 *
 * The navbar renders this twice -- inline on desktop, stacked in the mobile
 * menu -- so the list lives here rather than in the markup. Removing a page
 * used to mean editing every component that happened to list it, which is how
 * a link can outlive the page it points at.
 */
export function useNavigation(): { links: NavLink[] } {
    return {
        links: [
            {path: "/projects", label: "Projects"},
            {path: "/interests", label: "Interests"},
            {path: "/blog", label: "Blog"},
            {path: "/contact", label: "Contact"},
        ],
    };
}
