import {createClient} from "@supabase/supabase-js";

export const useSupabase = () => {
    const config = useRuntimeConfig();

    const supabase = createClient(
        config.public.supabaseUrl || config.supabaseUrl,
        config.public.supabaseKey || config.supabaseKey,
    );

    return {
        supabase,
    };
};
