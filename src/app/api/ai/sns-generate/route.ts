import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createGeminiClient, SYSTEM_PROMPTS, generateWhisperPrompt } from '@/lib/ai/gemini';
import { generateWhisper } from '@/lib/sales/whisper';
import type { SubscriptionTier, Platform, SnsMode } from '@/types';

const PLATFORM_SPECS = {
    x: {
        name: 'X (Twitter)',
        maxLength: 280,
        style: '簡潔で切れ味のある文章。フック重視。',
        hashtagCount: '2-3個',
    },
    instagram: {
        name: 'Instagram',
        maxLength: 2200,
        style: 'ストーリー性のある文章。感情に訴える。絵文字を適度に使用。',
        hashtagCount: '5-10個（コメント欄に分離推奨）',
    },
    facebook: {
        name: 'Facebook',
        maxLength: 63206,
        style: '詳細で価値提供型の文章。信頼性重視。',
        hashtagCount: '1-3個（控えめに）',
    },
};

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('tier')
            .eq('user_id', user.id)
            .single();

        const tier: SubscriptionTier = subscription?.tier || 'FREE';

        const {
            platform,
            mode,
            topic,
            collaborationPartner,
            eventDetails
        } = await request.json() as {
            platform: Platform;
            mode: SnsMode;
            topic: string;
            collaborationPartner?: string;
            eventDetails?: string;
        };

        if (!platform || !topic) {
            return NextResponse.json({ error: 'Platform and topic are required' }, { status: 400 });
        }

        const { data: userData } = await supabase
            .from('users')
            .select('settings, oracle_type')
            .eq('id', user.id)
            .single();

        const apiKey = userData?.settings?.gemini_api_key || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const model = createGeminiClient({ apiKey, tier });
        const platformSpec = PLATFORM_SPECS[platform];

        let prompt: string;

        if (mode === 'collab') {
            // Collaboration Mode
            prompt = `
${SYSTEM_PROMPTS.snsWriter}

【コラボ特化モード】
あなたはコミュニティ内でのコラボレーションを円滑にするSNS投稿の専門家です。

【作成対象】
- プラットフォーム: ${platformSpec.name}
- 文字数上限: ${platformSpec.maxLength}文字
- スタイル: ${platformSpec.style}

【コラボの詳細】
- コラボ相手: ${collaborationPartner || '（指定なし）'}
- イベント/企画内容: ${eventDetails || topic}

以下を作成してください：

1. **相手を立てる紹介文**（${platformSpec.maxLength > 500 ? '200-300文字' : '100-150文字'}）
   - 相手の魅力を最大限に引き出す
   - 「お作法」を守った丁寧な表現
   - 自分の宣伝にならないよう注意

2. **企画タイトル案**（3つ）
   - キャッチーで興味を引くもの
   - 双方のブランドを活かしたもの

3. **簡易スライド構成案**（5枚分）
   - 表紙
   - 自己紹介（連名）
   - 本題（価値提供）
   - まとめ
   - 告知/CTA

出力形式：
---
【紹介文】
[ここに紹介文]

【企画タイトル案】
1. [タイトル1]
2. [タイトル2]
3. [タイトル3]

【スライド構成】
1. [表紙内容]
2. [自己紹介の要点]
3. [本題の構成]
4. [まとめの要点]
5. [CTA]
---
`;
        } else {
            // Normal Mode
            prompt = `
${SYSTEM_PROMPTS.snsWriter}

【作成対象】
- プラットフォーム: ${platformSpec.name}
- 文字数上限: ${platformSpec.maxLength}文字
- スタイル: ${platformSpec.style}
- ハッシュタグ: ${platformSpec.hashtagCount}

【ユーザーのブランドタイプ】
${userData?.oracle_type ? JSON.stringify(userData.oracle_type) : '未診断'}

【投稿トピック】
${topic}

【指示】
上記のトピックに基づいて、以下を作成してください：

1. **投稿本文**
   - プラットフォームの特性に最適化
   - 冒頭3行で興味を引くフック
   - 自然なCTA

2. **ハッシュタグ**
   - エンゲージメントを高めるもの
   - プラットフォームのルールに沿った数

出力形式：
---
【投稿文】
[ここに投稿文]

【ハッシュタグ】
[ここにハッシュタグ]
---
`;
        }

        // Add whisper generation
        const whisperAddition = generateWhisperPrompt('completion', 'SNS投稿を作成');
        prompt += `

最後に、「軍師の独り言」を1文追加してください。
${whisperAddition}
`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Save to database
        const { data: savedDraft } = await supabase
            .from('sns_drafts')
            .insert({
                user_id: user.id,
                platform,
                mode,
                content: response,
                metadata: {
                    topic,
                    collaboration_partner: collaborationPartner,
                    event_details: eventDetails,
                },
            })
            .select()
            .single();

        // Log behavior
        await supabase.from('behavior_logs').insert({
            user_id: user.id,
            action_type: 'sns_generate',
            payload: { platform, mode, draft_id: savedDraft?.id },
        });

        const whisper = generateWhisper('completion', 1);

        return NextResponse.json({
            success: true,
            data: {
                content: response,
                draftId: savedDraft?.id,
                whisper,
            },
        });

    } catch (error) {
        console.error('SNS generate error:', error);
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }
}
