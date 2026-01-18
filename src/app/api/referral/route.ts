import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const REFERRALS_FOR_PRO = 3;
const PRO_DURATION_DAYS = 30;

// GET: Get user's referral info
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's referral code
        const { data: userData } = await supabase
            .from('users')
            .select('referral_code')
            .eq('id', user.id)
            .single();

        // Get referral count and list
        const { data: referrals, count } = await supabase
            .from('referrals')
            .select('id, created_at, referred_id', { count: 'exact' })
            .eq('referrer_id', user.id);

        // Get subscription status
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('tier, pro_expires_at, referral_count')
            .eq('user_id', user.id)
            .single();

        const referralCount = count || 0;
        const remaining = Math.max(0, REFERRALS_FOR_PRO - referralCount);

        return NextResponse.json({
            success: true,
            data: {
                referralCode: userData?.referral_code,
                referralCount,
                referralsForPro: REFERRALS_FOR_PRO,
                remaining,
                referrals: referrals || [],
                subscription: {
                    tier: subscription?.tier || 'FREE',
                    proExpiresAt: subscription?.pro_expires_at,
                },
                shareText: generateShareText(userData?.referral_code),
            },
        });

    } catch (error) {
        console.error('Get referral info error:', error);
        return NextResponse.json({ error: 'Failed to get referral info' }, { status: 500 });
    }
}

// POST: Redeem a referral code
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient(); // Normal client for auth check
        const adminClient = await createAdminClient(); // Admin client for DB ops

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { referralCode } = await request.json();

        if (!referralCode) {
            return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
        }

        // Find the referrer by code (Use Admin Client to bypass RLS)
        const { data: referrer, error: referrerError } = await adminClient
            .from('users')
            .select('id, referral_code')
            .ilike('referral_code', referralCode) // Case insensitive match
            .single();

        if (referrerError) console.error('🔍 Search Error:', referrerError);
        console.log('🔍 Search Result:', referrer);

        if (!referrer) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
        }

        // Can't use own code
        if (referrer.id === user.id) {
            return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
        }

        // Check if already referred (Use Admin Client)
        const { data: existingReferral } = await adminClient
            .from('referrals')
            .select('id')
            .eq('referred_id', user.id)
            .single();

        if (existingReferral) {
            return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 });
        }

        // Create referral record (Use Admin Client)
        const { error: referralError } = await adminClient
            .from('referrals')
            .insert({
                referrer_id: referrer.id,
                referred_id: user.id,
                referral_code: referralCode.toUpperCase(), // Satisfy Not-Null constraint
                reward_claimed: false,
            });

        if (referralError) {
            console.error('Create referral error:', referralError);
            return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 });
        }

        // Update referrer's count (Use Admin Client)
        const { data: referrerSub } = await adminClient
            .from('subscriptions')
            .select('referral_count')
            .eq('user_id', referrer.id)
            .single();

        const newCount = (referrerSub?.referral_count || 0) + 1;

        // If referrer reaches 3 referrals, grant Pro mode
        if (newCount >= REFERRALS_FOR_PRO) {
            const proExpires = new Date();
            proExpires.setDate(proExpires.getDate() + PRO_DURATION_DAYS);

            await adminClient
                .from('subscriptions')
                .update({
                    tier: 'PRO',
                    pro_expires_at: proExpires.toISOString(),
                    pro_source: 'referral',
                    referral_count: newCount,
                })
                .eq('user_id', referrer.id);
        } else {
            await adminClient
                .from('subscriptions')
                .update({ referral_count: newCount })
                .eq('user_id', referrer.id);
        }

        // Grant Pro to the referred user as well (Use Admin Client)
        const referredProExpires = new Date();
        referredProExpires.setDate(referredProExpires.getDate() + PRO_DURATION_DAYS);

        await adminClient
            .from('subscriptions')
            .update({
                tier: 'PRO',
                pro_expires_at: referredProExpires.toISOString(),
                pro_source: 'referral',
            })
            .eq('user_id', user.id);

        // Mark referral as rewarded
        await adminClient
            .from('referrals')
            .update({ reward_claimed: true })
            .eq('referrer_id', referrer.id)
            .eq('referred_id', user.id);

        // Log behavior
        await adminClient.from('behavior_logs').insert({
            user_id: user.id,
            action_type: 'referral_share',
            payload: { referrer_id: referrer.id, type: 'redeemed' },
        });

        return NextResponse.json({
            success: true,
            data: {
                message: '招待コードが適用されました！30日間のPROモードが有効になりました🎉',
                proExpiresAt: referredProExpires.toISOString(),
            },
        });

    } catch (error: any) {
        console.error('Redeem referral error:', error);
        return NextResponse.json({
            error: '招待の処理に失敗しました: ' + (error.message || String(error)),
            details: error.stack
        }, { status: 500 });
    }
}

function generateShareText(code: string | undefined): Record<string, string> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://brain-hub.pro';
    const link = `${baseUrl}?ref=${code}`;

    return {
        x: `🧠 ビジネスの壁打ちはAIにお任せ！\n\nA1 Oracle Hubを使い始めたら、SNS発信もタスク管理も劇的に楽になった✨\n\nこのリンクから登録すると、お互い30日間PROが無料になるよ👇\n${link}\n\n#AI活用 #起業家`,
        facebook: `A1 Oracle Hubというツールを使い始めました！\nAIが壁打ちしてくれるし、SNS投稿も自動生成してくれる。\n\nこのリンクから登録すると、お互い30日間プレミアム機能が使えます。\n${link}`,
        line: `これ良かったよ！AIがビジネスの相談に乗ってくれるツール。\n${link}\nここから登録すると30日間Pro使えるから試してみて！`,
    };
}
