import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Server Component context - ignore
                    }
                },
            },
        }
    );
}

// Admin client with service role key (bypasses RLS)
export async function createAdminClient() {
    // Note: We do NOT pass cookies here. This client should be purely for admin tasks
    // and should not inherit the current user's session.
    // We use a dummy cookie adapter to satisfy the type requirement if needed, 
    // or typically createServerClient allows empty options or we can use supabase-js directly.
    // But sticking to createServerClient for consistency, just with empty cookies.

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return [];
                },
                setAll(cookiesToSet) {
                    // No-op
                },
            },
        }
    );
}
