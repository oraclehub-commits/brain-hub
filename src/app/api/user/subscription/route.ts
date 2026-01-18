import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('tier, pro_expires_at, pro_source, referral_count')
            .eq('user_id', user.id)
            .single();

        const isPro =
            subscription?.tier === 'PRO' &&
            (!subscription?.pro_expires_at || new Date(subscription.pro_expires_at) > new Date());

        return NextResponse.json({
            success: true,
            tier: isPro ? 'PRO' : 'FREE',
            proExpiresAt: subscription?.pro_expires_at,
            proSource: subscription?.pro_source,
            referralCount: subscription?.referral_count || 0,
            features: {
                // Finance
                canExportCsv: isPro,
                canExportYayoi: isPro,
                canExportFreee: isPro,
                financeHistoryLimit: isPro ? 'unlimited' : '3_months',
                // Archive
                driveBackup: isPro,
                maxStorage: isPro ? 'unlimited' : '100MB',
                // Spy Mode
                maxCompetitors: isPro ? 20 : 1,
            }
        });
    } catch (error: any) {
        console.error('Subscription API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
