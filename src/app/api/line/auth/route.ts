import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LineClient } from '@/lib/line/client';

/**
 * LINE LIFF Authentication Endpoint
 * POST /api/line/auth
 * 
 * Body: { liffAccessToken: string }
 * 
 * Flow:
 * 1. Receive LIFF access token from client
 * 2. Get LINE profile (userId, displayName, pictureUrl)
 * 3. Link LINE userId with current Google user
 * 4. Set appropriate rich menu based on subscription tier
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { liffAccessToken } = await req.json();

        if (!liffAccessToken) {
            return NextResponse.json({ error: 'LIFF access token is required' }, { status: 400 });
        }

        // Get LINE profile using LIFF token
        const lineClient = new LineClient(''); // Empty for profile API call
        const lineProfile = await lineClient.getProfile(liffAccessToken);

        // Check if this LINE account is already linked to another user
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('line_user_id', lineProfile.userId)
            .single();

        if (existingUser && existingUser.id !== user.id) {
            return NextResponse.json({
                error: 'このLINEアカウントは既に別のユーザーと連携されています'
            }, { status: 400 });
        }

        // Update user with LINE information
        const { error: updateError } = await supabase
            .from('users')
            .update({
                line_user_id: lineProfile.userId,
                line_display_name: lineProfile.displayName,
                line_picture_url: lineProfile.pictureUrl,
                line_connected_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Failed to update user with LINE info:', updateError);
            return NextResponse.json({ error: 'Failed to link LINE account' }, { status: 500 });
        }

        // Get user's subscription tier to determine rich menu
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('tier')
            .eq('user_id', user.id)
            .single();

        const isPro = subscription?.tier === 'PRO';

        // Set rich menu based on tier
        // Note: You need to create these rich menus in LINE Developers Console first
        const richMenuId = isPro
            ? process.env.LINE_RICH_MENU_PRO
            : process.env.LINE_RICH_MENU_FREE;

        if (richMenuId) {
            try {
                const messagingClient = new LineClient(process.env.LINE_CHANNEL_ACCESS_TOKEN!);
                await messagingClient.setUserRichMenu(lineProfile.userId, richMenuId);

                // Save rich menu ID to database
                await supabase
                    .from('users')
                    .update({ line_rich_menu_id: richMenuId })
                    .eq('id', user.id);
            } catch (menuError) {
                console.error('Failed to set rich menu:', menuError);
                // Don't fail the whole request if rich menu fails
            }
        }

        // Log behavior
        await supabase.from('behavior_logs').insert({
            user_id: user.id,
            action_type: 'line_connected',
            payload: {
                line_user_id: lineProfile.userId,
                tier: isPro ? 'PRO' : 'FREE'
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                message: 'LINE連携が完了しました！🎉',
                lineProfile: {
                    displayName: lineProfile.displayName,
                    pictureUrl: lineProfile.pictureUrl,
                },
            },
        });

    } catch (error: any) {
        console.error('LINE auth error:', error);
        return NextResponse.json({
            error: 'LINE連携に失敗しました: ' + (error.message || String(error)),
        }, { status: 500 });
    }
}
