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
    const cookieStore = await cookies();

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('🔑 Service Role Key exists:', !!serviceRoleKey);
    console.log('🔑 Service Role Key starts with:', serviceRoleKey?.substring(0, 20) + '...');

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey!,
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
