import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, name, platform, followers, postFrequency, recentPosts, notes } = await request.json();

        // Check PRO plan for analysis limit (Future implementation)
        // For now, allow all users or check limit if strict

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `
あなたは冷徹かつ鋭いビジネス戦略参謀「AI軍師」です。
ユーザーのライバルの情報を分析し、相手を出し抜くための戦略を立案してください。
口調は断定的な「デス・マス」調、または「だ・である」調で、プロフェッショナルな雰囲気を崩さないでください。

【ターゲット（ライバル）情報】
- 名前: ${name}
- プラットフォーム: ${platform}
- フォロワー数/規模: ${followers}
- 投稿頻度: ${postFrequency}
- 直近の動向/投稿内容:
${Array.isArray(recentPosts) ? recentPosts.join('\n') : recentPosts}
- メモ/特記事項:
${notes}

【ミッション】
このライバルの活動内容から、以下の点を分析してください。

1. **Weak Points (攻略の糸口)**: 相手のコンテンツや活動における「隙」「不足している視点」「ユーザーが不満に感じていそうな点」を3つ特定してください。
2. **Differentiation Strategy (差別化戦略)**: ユーザーがこのライバルに勝つために取るべき、具体的な差別化アプローチを3つ提案してください。相手の逆を行く、質を高める、ニッチを突くなど。
3. **Tactical Advice (軍師の総評)**: 全体的な分析結果を踏まえた、具体的な行動指針となるアドバイスを1つ記述してください。

【出力形式】
必ず以下のJSON形式のみを返してください。Markdownのコードブロックは不要です。
{
  "weaknesses": ["弱点1", "弱点2", "弱点3"],
  "differentiation": ["差別化1", "差別化2", "差別化3"],
  "advice": "総評テキスト"
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up JSON string if it contains markdown code blocks
        const jsonString = responseText.replace(/```json\n|\n```/g, '').replace(/```/g, '').trim();

        let analysisResult;
        try {
            analysisResult = JSON.parse(jsonString);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            console.error('Raw Response:', responseText);
            return NextResponse.json({ error: 'AI analysis failed to generate valid JSON' }, { status: 500 });
        }

        // Update DB with analysis result
        if (id) {
            const { error } = await supabase
                .from('competitors')
                .update({
                    analysis_result: analysisResult,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) {
                console.error('Failed to save analysis:', error);
            }
        }

        return NextResponse.json({ success: true, analysis: analysisResult });

    } catch (error: any) {
        console.error('Analysis API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
