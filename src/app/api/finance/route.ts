import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/gemini/client';

// GET: Fetch all finance logs and diagnosis
export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: logs, error } = await supabase
            .from('finance_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (error) {
            console.error('Failed to fetch finance logs:', error);
            return NextResponse.json({ error: 'Failed to fetch finance logs' }, { status: 500 });
        }

        // Calculate summary
        const totalIncome = logs
            ?.filter(l => l.type === 'income')
            .reduce((sum, l) => sum + l.amount, 0) || 0;

        const totalExpense = logs
            ?.filter(l => l.type === 'expense')
            .reduce((sum, l) => sum + l.amount, 0) || 0;

        const balance = totalIncome - totalExpense;

        return NextResponse.json({
            success: true,
            logs,
            summary: {
                totalIncome,
                totalExpense,
                balance,
            },
        });
    } catch (error: any) {
        console.error('Finance API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create a new finance log or get AI diagnosis
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // AI Diagnosis request
        if (body.action === 'diagnose') {
            return await handleDiagnosis(supabase, user.id);
        }

        // Create finance log
        const { type, amount, category, description, date } = body;

        if (!type || !amount) {
            return NextResponse.json({ error: 'Type and amount are required' }, { status: 400 });
        }

        const { data: log, error } = await supabase
            .from('finance_logs')
            .insert({
                user_id: user.id,
                type,
                amount,
                category: category || '',
                description: description || '',
                date: date || new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to create finance log:', error);
            return NextResponse.json({ error: 'Failed to create finance log' }, { status: 500 });
        }

        return NextResponse.json({ success: true, log });
    } catch (error: any) {
        console.error('Create Finance Log API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// AI健全性診断ロジック
async function handleDiagnosis(supabase: any, userId: string) {
    try {
        // Get finance logs
        const { data: logs } = await supabase
            .from('finance_logs')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(100);

        // Get user's activity data
        const { data: sessions } = await supabase
            .from('oracle_sessions')
            .select('id')
            .eq('user_id', userId);

        const totalIncome = logs
            ?.filter((l: any) => l.type === 'income')
            .reduce((sum: number, l: any) => sum + l.amount, 0) || 0;

        const totalExpense = logs
            ?.filter((l: any) => l.type === 'expense')
            .reduce((sum: number, l: any) => sum + l.amount, 0) || 0;

        const balance = totalIncome - totalExpense;

        // AI診断用のプロンプト
        const diagnosisPrompt = `あなたは「A1 Oracle Hub」のビジネス健全性診断AIです。以下の原則を厳守してください。

【絶対原則】
1. **原因を「ユーザーの資質」ではなく「思考OSのバージョン」にする**
   - 「あなたのやり方が悪い」ではなく、「今のフェーズに対して、ツールの使いこなしがまだ追いついていない」
2. **講座を「原因」ではなく「唯一の特効薬」にする**
   - 「できていないからダメ」ではなく、「この停滞を打破する具体的な奥義が講座にあります」
3. **投資を「経費」ではなく「資産」として分類させる**
   - こちらへの支払いは「未来の利益を作るための自己投資（資産形成）」として評価

【診断データ】
- 総収入: ¥${totalIncome.toLocaleString()}
- 総支出: ¥${totalExpense.toLocaleString()}
- 収支: ¥${balance.toLocaleString()}
- 相談セッション数: ${sessions?.length || 0}件

【診断項目】
1. **投資効率**: 学びの収穫期を控えた「仕込み」の時期。投資した知識を現金化するスピードを上げましょう。
2. **行動の純度**: SNS投稿は多いが、成約に繋がる「毒」が足りない。綺麗事に寄りすぎている可能性。
3. **資産蓄積度**: Oracle Hubにデータが溜まってきた = 分身が育っている証拠。あとは出口（成約）を作るだけ。

【もし数字が停滞している場合】
「数字だけを見れば停滞していますが、Brain Hubに蓄積されたあなたの思考データを見ると、**成功の『臨界点』**まであと15%のところに来ています。今、あなたに必要なのは新しいノウハウではなく、**『脳の使い方の微調整』**です。」

【重要】
- ポジティブ・リフレーミング必須
- 悪い数字は「次の成長の種」として定義
- 講座への誘導は自然に、押し付けがましくなく
- 具体的で実行可能なアドバイスを含める

日本語で、共感的で前向きな診断結果を生成してください（300-400文字）:`;

        const aiResult = await generateContent(diagnosisPrompt);

        if (!aiResult.success) {
            return NextResponse.json({ error: 'AI diagnosis failed' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            diagnosis: aiResult.text,
            summary: {
                totalIncome,
                totalExpense,
                balance,
                sessionCount: sessions?.length || 0,
            },
        });
    } catch (error: any) {
        console.error('Diagnosis Error:', error);
        return NextResponse.json({ error: 'Failed to generate diagnosis' }, { status: 500 });
    }
}
