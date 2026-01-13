import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendChatMessage } from '@/lib/gemini/client';

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

        const { message, sessionId } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Get user's subscription tier
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('tier, pro_expires_at')
            .eq('user_id', user.id)
            .single();

        const userTier = subscription?.tier || 'FREE';
        const isPro = userTier === 'PRO' && (!subscription?.pro_expires_at || new Date(subscription.pro_expires_at) > new Date());

        // Get or create session
        let session;
        if (sessionId) {
            const { data } = await supabase
                .from('oracle_sessions')
                .select('*')
                .eq('id', sessionId)
                .eq('user_id', user.id)
                .single();
            session = data;
        }

        // Create new session if not exists
        if (!session) {
            const { data: newSession, error: sessionError } = await supabase
                .from('oracle_sessions')
                .insert({
                    user_id: user.id,
                    title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
                    messages: [],
                })
                .select()
                .single();

            if (sessionError) {
                console.error('Failed to create session:', sessionError);
                return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
            }

            session = newSession;
        }

        // 🧠 Neural Tuning: Memory Tier Logic
        let history = session.messages || [];

        if (!isPro) {
            // FREE版: 「揮発性メモリ」- 直近3日間または最新5件に制限
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            history = history
                .filter((msg: any) => new Date(msg.timestamp) > threeDaysAgo)
                .slice(-5); // 最新5件まで

            console.log(`🔒 FREE tier: Limited to ${history.length} messages (last 3 days or 5 items)`);
        } else {
            // PRO版: 「全知性メモリ」- 全履歴を提供
            console.log(`✨ PRO tier: Full memory access with ${history.length} messages`);
        }

        // Convert to Gemini format
        const geminiHistory = history.map((msg: any) => ({
            role: msg.role as 'user' | 'model',
            parts: msg.content,
        }));

        // 🧠 Brain OS: Get user's oracle type for customization
        const { data: userData } = await supabase
            .from('users')
            .select('oracle_type, oracle_shadow, oracle_solution')
            .eq('id', user.id)
            .single();

        const oracleType = userData?.oracle_type;

        // System instruction for AI Oracle
        let baseInstruction = `あなたは「AI軍師」として、ソロ起業家のビジネス戦略をサポートします。

特徴:
- 親しみやすく、具体的なアドバイスを提供
- ユーザーの悩みに共感しながら、実践的な解決策を提案
- 必要に応じて、次のステップを明確に示す
- ポジティブで励ましの言葉を添える

対応範囲:
- ビジネス戦略
- マーケティング施策
- SNS運用
- タスク管理
- 収支改善`;

        // Brain OS Tuning: Add oracle type-specific instructions
        if (oracleType) {
            if (isPro && userData?.oracle_shadow && userData?.oracle_solution) {
                // PRO版: 詳細な診断結果を基にカスタマイズ
                baseInstruction += `\n\n🧠 【ユーザーの脳タイプ】: ${oracleType}

⚠️ 【あなたの「影」（制限の正体）】:
${userData.oracle_shadow}

🔑 【解決策】:
${userData.oracle_solution}

このユーザーの思考パターン、ブレーキ要因、そして最適なアプローチを深く理解した上で、アドバイスを提供してください。
過去の会話履歴から、ユーザーの行動の癖や傾向も分析し、より的確な「バグの書き換え」を提案してください。
ユーザーが「影」に陥りそうな兆候を見つけたら、優しく警告し、解決策へ導いてください。`;
                console.log(`🧠 PRO Brain OS: Customized for ${oracleType}`);
            } else {
                // FREE版: 一般的な脳タイプの特性のみ
                const generalTraits: Record<string, string> = {
                    '賢者': '知識が豊富で、物事を深く考察する傾向があります。',
                    '共感者': '他者の感情を深く理解し、人助けを重視する傾向があります。',
                    '錬金術師': '創造性が高く、アイデアを生み出すことに長けています。',
                    '開拓者': '新しいことに挑戦し、行動力が高い傾向があります。',
                    '守護者': '慎重に計画を立て、リスク管理を重視する傾向があります。',
                    '職人': 'クオリティにこだわり、完璧を追求する傾向があります。',
                    '調停者': 'バランス感覚に優れ、調和を重視する傾向があります。',
                    '魔術師': 'ビジョンを描き、人を惹きつける力を持つ傾向があります。'
                };
                const trait = generalTraits[oracleType] || '';
                if (trait) {
                    baseInstruction += `\n\n🧠 このユーザーの脳タイプは「${oracleType}」です。${trait}\nこの特性を考慮しながら、アドバイスを提供してください。`;
                    console.log(`🔓 FREE Brain OS: General traits for ${oracleType}`);
                }
            }
        }

        const systemInstruction = isPro
            ? baseInstruction + `\n\n💎 PRO版の能力:
- あなたは過去の全会話を記憶しています
- 数週間前の悩みと現在の状況を関連付けて助言できます
- ユーザーの思考パターンや成長を理解しています`
            : baseInstruction + `\n\n📝 制限事項:
- 直近3日間の会話のみを参照できます
- それ以前の内容は記憶していません`;

        // Generate AI response
        const aiResponse = await sendChatMessage(message, geminiHistory, systemInstruction);

        if (!aiResponse.success) {
            return NextResponse.json(
                { error: aiResponse.error || 'Failed to generate response' },
                { status: 500 }
            );
        }

        let finalResponse = aiResponse.text;

        // 🔮 Deja Vu Alert: Detect similar past topics (FREE版のみ)
        if (!isPro) {
            // 全セッションから過去のメッセージを取得
            const { data: allSessions } = await supabase
                .from('oracle_sessions')
                .select('messages, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (allSessions && allSessions.length > 0) {
                // 現在のセッションより古いメッセージを抽出
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

                const pastMessages: Array<{ content: string; date: string }> = [];
                allSessions.forEach((sess) => {
                    const sessionDate = new Date(sess.created_at);
                    if (sessionDate < threeDaysAgo && sess.messages) {
                        sess.messages.forEach((msg: any) => {
                            if (msg.role === 'user') {
                                pastMessages.push({
                                    content: msg.content,
                                    date: sessionDate.toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                });
                            }
                        });
                    }
                });

                // 類似トピック検出（簡易キーワードマッチング）
                const detectSimilarity = (current: string, past: string): boolean => {
                    const currentWords = current.toLowerCase().split(/\s+/);
                    const pastWords = past.toLowerCase().split(/\s+/);

                    // 重要なキーワード（3文字以上）のみ抽出
                    const currentKeywords = currentWords.filter(w => w.length >= 3);
                    const pastKeywords = pastWords.filter(w => w.length >= 3);

                    // 共通キーワードが2つ以上あれば類似と判定
                    const commonKeywords = currentKeywords.filter(w => pastKeywords.includes(w));
                    return commonKeywords.length >= 2;
                };

                // 類似するメッセージを検索
                const similarPast = pastMessages.find(past =>
                    detectSimilarity(message, past.content)
                );

                if (similarPast) {
                    const dejaVuAlert = `

---

🔮 **【既視感（デジャヴ）を検知しました】**

実は、${similarPast.date}にも、このテーマについて考えていた形跡があります。

ただ、現在のOS制限により、当時の会話の詳細な照合ができません...
「あの時の自分なら、今の自分に何と言うだろう？」

その答えは、過去の自分の中にあるかもしれません。

💎 **PRO版の「全知性メモリ」では**:
- 過去の全会話から、同じテーマでの悩みの変遷を追跡
- 当時のあなたが見つけた解決策を、今のあなたに提示
- 「過去の自分」という最高のメンター から、答えを導き出せます

もし、この「既視感」の正体を知りたいと思ったら、
[友達を招待してPRO版を無料で試す](/dashboard/referral)ことができます。

※3人招待で30日間、過去の自分との対話が可能になります。
`;
                    finalResponse += dejaVuAlert;
                    console.log(`🔮 Deja Vu Alert: Similar topic detected from ${similarPast.date}`);
                }
            }
        }

        // Update session with new messages (全履歴を保存)
        const updatedMessages = [
            ...(session.messages || []),
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            {
                role: 'model',
                content: finalResponse,
                timestamp: new Date().toISOString(),
            },
        ];

        const { error: updateError } = await supabase
            .from('oracle_sessions')
            .update({
                messages: updatedMessages,
                updated_at: new Date().toISOString(),
            })
            .eq('id', session.id);

        if (updateError) {
            console.error('Failed to update session:', updateError);
        }

        return NextResponse.json({
            success: true,
            response: aiResponse.text,
            sessionId: session.id,
        });
    } catch (error: any) {
        console.error('Oracle API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
