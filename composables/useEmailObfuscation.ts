/**
 * Composable for email obfuscation to prevent scraping
 */
export const useEmailObfuscation = () => {
    /**
     * Encodes an email address to base64
     */
    const encodeEmail = (email: string): string => {
        if (typeof window !== "undefined") {
            return btoa(email);
        }
        return Buffer.from(email).toString("base64");
    };

    /**
     * Decodes a base64 encoded email
     */
    const decodeEmail = (encoded: string): string => {
        if (typeof window !== "undefined") {
            return atob(encoded);
        }
        return Buffer.from(encoded, "base64").toString("ascii");
    };

    /**
     * Creates a mailto link with decoded email
     */
    const createMailtoLink = (
        encodedEmail: string,
        subject?: string,
        body?: string,
    ): string => {
        const email = decodeEmail(encodedEmail);
        let link = `mailto:${email}`;

        const params = new URLSearchParams();
        if (subject) params.append("subject", subject);
        if (body) params.append("body", body);

        const queryString = params.toString();
        if (queryString) {
            link += `?${queryString}`;
        }

        return link;
    };

    /**
     * Reveals and navigates to email
     */
    const revealEmail = (
        encodedEmail: string,
        subject?: string,
        body?: string,
    ) => {
        window.location.href = createMailtoLink(encodedEmail, subject, body);
    };

    return {
        encodeEmail,
        decodeEmail,
        createMailtoLink,
        revealEmail,
    };
};
