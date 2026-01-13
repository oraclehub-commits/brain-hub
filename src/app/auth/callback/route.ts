import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Use admin client for database operations (bypasses RLS)
            const adminSupabase = await createAdminClient();

            // Check if user profile exists, if not create one
            const { data: existingUser } = await adminSupabase
                .from('users')
                .select('id')
                .eq('id', data.user.id)
                .single();

            if (!existingUser) {
                console.log('🔄 Creating new user profile for:', data.user.email);

                // Create new user profile
                const referralCode = `ORACLE-${data.user.id.slice(0, 6).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;
                console.log('📝 Generated referral code:', referralCode);

                const { data: userData, error: userError } = await adminSupabase.from('users').insert({
                    id: data.user.id,
                    email: data.user.email,
                    display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
                    avatar_url: data.user.user_metadata?.avatar_url,
                    referral_code: referralCode,
                    settings: {
                        notifications_enabled: true,
                        email_digest: false,
                        theme: 'dark',
                    },
                    oracle_type: null,
                });

                if (userError) {
                    console.error('❌ Failed to create user:', userError);
                } else {
                    console.log('✅ User created successfully');
                }

                // Create initial subscription (FREE tier)
                const { data: subData, error: subError } = await adminSupabase.from('subscriptions').insert({
                    user_id: data.user.id,
                    tier: 'FREE',
                    pro_expires_at: null,
                    pro_source: null,
                    referral_count: 0,
                });

                if (subError) {
                    console.error('❌ Failed to create subscription:', subError);
                } else {
                    console.log('✅ Subscription created successfully');
                }
            } else {
                console.log('👤 User already exists:', data.user.email);
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
