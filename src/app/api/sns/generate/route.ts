import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/gemini/client';

interface GenerateRequest {
    platform: 'x' | 'instagram' | 'facebook';
    mode: 'normal' | 'collab';
    topic: string;
    collaborationPartner?: string;
    eventDetails?: string;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: GenerateRequest = await request.json();
        const { platform, mode, topic, collaborationPartner, eventDetails } = body;

        if (!platform || !mode || !topic) {
            return NextResponse.json(
                { error: 'Platform, mode, and topic are required' },
                { status: 400 }
            );
        }

        // Generate platform-specific prompt
        const prompt = generatePrompt(platform, mode, topic, collaborationPartner, eventDetails);

        // Generate content using Gemini
        const result = await generateContent(prompt);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to generate content' },
                { status: 500 }
            );
        }

        // Save to database
        const { data: post, error: dbError } = await supabase
            .from('sns_posts')
            .insert({
                user_id: user.id,
                platform,
                mode,
                topic,
                collaboration_partner: collaborationPartner || null,
                event_details: eventDetails || null,
                generated_content: result.text,
            })
            .select()
            .single();

        if (dbError) {
            console.error('Failed to save post:', dbError);
        }

        return NextResponse.json({
            success: true,
            content: result.text,
            postId: post?.id,
        });
    } catch (error: any) {
        console.error('SNS Generate API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

function generatePrompt(
    platform: string,
    mode: string,
    topic: string,
    collaborationPartner?: string,
    eventDetails?: string
): string {
    const platformSpecs = {
        x: {
            name: 'X（旧Twitter）',
            charLimit: 280,
            style: '簡潔で、共感を呼ぶ。ハッシュタグを2-3個含める。',
        },
        instagram: {
            name: 'Instagram',
            charLimit: 2200,
            style: 'ビジュアルを想起させる表現。改行を活用。絵文字を適度に使用。ハッシュタグは5-10個。',
        },
        facebook: {
            name: 'Facebook',
            charLimit: 1000,
            style: 'ストーリー性があり、親しみやすい。質問形式で終わると良い。',
        },
    };

    const spec = platformSpecs[platform as keyof typeof platformSpecs];

    let basePrompt = `あなたはソロ起業家向けのSNSライティングアシスタントです。

プラットフォーム: ${spec.name}
文字数制限: 約${spec.charLimit}文字以内
スタイル: ${spec.style}

トピック: ${topic}
`;

    if (mode === 'collab' && collaborationPartner) {
        basePrompt += `
モード: コラボ投稿
コラボ相手: ${collaborationPartner}
`;
        if (eventDetails) {
            basePrompt += `企画詳細: ${eventDetails}\n`;
        }

        basePrompt += `
コラボ投稿として、以下を含めてください：
- コラボ相手への感謝
- 企画の魅力
- フォロワーへの参加呼びかけ
`;
    } else {
        basePrompt += `
モード: 通常投稿

以下を含めてください：
- トピックへの深い洞察
- 読者の共感を呼ぶ表現
- アクションを促すCTA（コール・トゥ・アクション）
`;
    }

    basePrompt += `
重要:
- 自然で親しみやすい日本語
- ${spec.name}のベストプラクティスに従う
- エンゲージメントを高める工夫

投稿本文のみを生成してください（説明や注釈は不要）:`;

    return basePrompt;
}
