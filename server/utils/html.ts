const HTML_ENTITIES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

/**
 * Escape a user-supplied string for interpolation into an HTML template.
 *
 * Without this, anything a visitor types in the contact form is injected raw
 * into the notification email's markup.
 */
export function escapeHtml(value: unknown): string {
    return String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]!);
}

/**
 * Strip CR/LF from a value destined for an email header.
 *
 * A newline in the subject line lets a sender append headers of their own
 * (header injection), e.g. an extra `Bcc:`.
 */
export function sanitizeHeaderValue(value: string, maxLength = 200): string {
    return value.replace(/[\r\n]+/g, " ").trim().slice(0, maxLength);
}
