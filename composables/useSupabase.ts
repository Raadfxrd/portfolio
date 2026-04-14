import {createClient} from "@supabase/supabase-js";

const decodeJwtPayload = (token: string) => {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadPart = parts[1];
    if (!payloadPart) return null;

    try {
        const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        const decoded =
            typeof atob === "function"
                ? atob(padded)
                : Buffer.from(padded, "base64").toString("utf-8");
        return JSON.parse(decoded);
    } catch {
        return null;
    }
};

export const useSupabase = () => {
    const config = useRuntimeConfig();

    const supabaseUrl = String(config.public.supabaseUrl || config.supabaseUrl || "");
    const supabaseKey = String(config.public.supabaseKey || config.supabaseKey || "");

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase URL/key not configured. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY.");
    }

    const hostRef = (() => {
        try {
            return new URL(supabaseUrl).hostname.split(".")[0];
        } catch {
            return "";
        }
    })();
    const payload = decodeJwtPayload(supabaseKey);
    const keyRef = payload?.ref ? String(payload.ref) : "";

    // Catch mixed project URL/key combinations early to avoid opaque Storage API errors.
    if (hostRef && keyRef && hostRef !== keyRef) {
        throw new Error(
            `Supabase URL/key mismatch: URL project '${hostRef}' but anon key is for '${keyRef}'. Update NUXT_PUBLIC_SUPABASE_ANON_KEY.`,
        );
    }

    const supabase = createClient(
        supabaseUrl,
        supabaseKey,
    );

    return {
        supabase,
    };
};
