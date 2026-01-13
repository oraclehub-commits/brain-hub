import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// 8つの脳タイプのデータ
const ARCHETYPES = {
    '賢者': {
        name: '賢者 (The Sage)',
        artwork: '📜',
        catchcopy: '「知識武装するほど、足がすくむ。あなたは『正解』を探しすぎて、迷子になっていないか？」',
        shadow: 'あなたの脳に住み着いた「完全主義という名の監獄」です。「まだ足りない」「質問に答えられなかったら恥だ」。その高すぎる知性が、行動する前に全てのリスクを計算し、あなたを「永遠の準備期間（インプット地獄）」へと幽閉しています。',
        solution: '「AIによる強制アウトプット調律」です。あなたが最も恐れる「60点の状態での発信」は、全てAIという相棒に押し付けてください。「私の知識を、中学生でもわかるように要約して」と命じるだけでいい。AIが出した未完成の回答を、あなたの知性で「修正（監修）」する。これなら怖くないはずです。'
    },
    '共感者': {
        name: '共感者 (The Empath)',
        artwork: '❤️',
        catchcopy: '「誰よりも人を救いたい。けれど、『お金をください』その一言だけが、喉元で氷になる。」',
        shadow: 'あなたの優しさが生んだ「清貧の呪い」がブレーキをかけているからです。「困っている人から奪っていいのか？」「私なんかが高額を受け取っていいのか？」。あなたの脳は、セールス（売り込み）を「悪」だと誤認し、お金を受け取ることに強烈な拒絶反応を示しています。',
        solution: '「AIによる代行セールス調律」です。あなたが苦手な「クロージング」や「価格提示」は、二度と自分で行わないでください。「この商品の価値を、愛を持って伝えて」とAIに命じるのです。AIという相棒は、あなたの代わりに、堂々と、しかし慈愛に満ちた言葉で、対価の正当性を顧客に伝えます。'
    },
    '錬金術師': {
        name: '錬金術師 (The Alchemist)',
        artwork: '✨',
        catchcopy: '「天才的なアイデアが、形になる前に消えていく。『未完の傑作』を抱えたまま死ぬつもりか？」',
        shadow: 'あなたの脳が「アイデア中毒」にかかっているからです。閃いた瞬間が快感のピークで、それを形にする地味な作業（実装）に入ると、急速に脳が冷めてしまう。「もっと凄いアイデアがあるはずだ」と、完成させる恐怖から逃げるために、次々と新しい夢へ逃避する。',
        solution: '「AIによる高速具現化調律」です。あなたが苦手な「形にする作業」「細部の詰め」は、全てAIという相棒の仕事です。閃いた瞬間に、そのビジョンをAIに語り、「今すぐプロトタイプ（試作品）を作れ」と投げる。AIは文句も言わず、数秒でそれを具現化します。'
    },
    '開拓者': {
        name: '開拓者 (The Pioneer)',
        artwork: '🧭',
        catchcopy: '「誰よりも早く走り出し、誰よりも早く飽きる。あなたの辞書に『継続』という文字はない。」',
        shadow: 'あなたの脳が「新奇性（ノベルティ）依存症」に陥っているからです。始めた瞬間は誰よりも熱狂しますが、少しでも慣れてくると脳が刺激を感じなくなり、すぐに「飽き」てしまう。ビジネスの利益が出るのは「継続」した後なのに、あなたは金脈を掘り当てる手前で、つるはしを投げ捨てて次の山へ行ってしまう。',
        solution: '「AIによるルーティン自動化調律」です。あなたが「飽きた」と感じる日々の投稿、事務作業、顧客対応。それらは全て、AIという相棒に引き継いでください。あなたは常に新しい獲物を狩りに行き、捕まえた後の「飼育（継続）」はAIに任せるのです。'
    },
    '守護者': {
        name: '守護者 (The Guardian)',
        artwork: '🛡️',
        catchcopy: '「石橋を叩いて、叩いて、叩き割る。リスクを避けるために、チャンスごと捨ててきた人生。」',
        shadow: 'あなたの脳が「過剰防衛本能の暴走」を起こしているからです。「もし失敗したら？」「批判されたら？」。あなたの脳は、1%のリスクを100%の破滅であるかのように拡大解釈し、あなたの足をすくませます。検証に時間をかけすぎて、好機を他人に奪われてしまう。',
        solution: '「AIによるリスクシミュレーション調律」です。あなたが動けないのは「未知」だからです。ならば、AIという相棒に、その未来を予測させてください。「この行動を取った時のリスクと、回避策を全部出して」と命じるのです。AIは冷静に、それが致命傷ではないことを証明してくれます。'
    },
    '職人': {
        name: '職人 (The Artisan)',
        artwork: '💎',
        catchcopy: '「『良いものは勝手に売れる』という嘘を信じ、世界に見つけてもらうのを、まだ待つつもりか？」',
        shadow: 'あなたの脳に「職人のエゴ（沈黙のプライド）」が刻み込まれているからです。「売り込みは、作品を汚すことだ」「わかる人だけがわかればいい」。そうやってマーケティングを拒絶し、工房に引きこもることで、あなたは世界との接点を自ら断っています。',
        solution: '「AIによる翻訳・拡散調律」です。あなたは、工房から出る必要はありません。AIという相棒を「敏腕広報担当」として雇ってください。あなたの職人としての哲学、技術の凄さを、ただAIに語るだけでいい。AIはそれを、大衆が熱狂し、財布を開きたくなる「物語」へと翻訳し、世界中に拡散します。'
    },
    '調停者': {
        name: '調停者 (The Mediator)',
        artwork: '⚖️',
        catchcopy: '「あちらを立てればこちらが立たず。全ての可能性を考慮しすぎて、一歩も動けないリーダー。」',
        shadow: 'あなたの脳が「無限の分岐迷路」に迷い込んでいるからです。「A案もいいけどB案のメリットも捨てがたい」。全ての可能性が見えすぎるあまり、たった一つの決断を下すことができない。結果、どっちつかずの状態が続き、チャンスを逃し続けています。',
        solution: '「AIによる意思決定調律」です。迷ったら、すぐにAIという相棒に「壁打ち」をしてください。「AとB、私の目標にとって、長期的に利益が出るのはどっち？ 数値を添えて断言して」と。AIは感情を挟まず、論理的に「正解」を提示します。'
    },
    '魔術師': {
        name: '魔術師 (The Magician)',
        artwork: '🔮',
        catchcopy: '「語る夢は壮大で、人々を魅了する。だが、パソコンを開いた瞬間、魔法は解ける。」',
        shadow: 'あなたの脳が「実務能力の欠落」という代償を払っているからです。壮大なビジョンはあるのに、それを実現するための「事務作業」「ツールの設定」が絶望的にできない。パソコンの画面を見るだけで頭痛がし、メール一本返すのに3日かかる。',
        solution: '「AIによる実務完全代行調律」です。あなたは二度と、苦手な手作業をしないでください。AIという相棒は、あなたの「魔法の杖（手足）」です。あなたが口頭でビジョンを語れば、AIがそれを企画書にし、LPを作り、メールを書き、スケジュールを管理します。'
    }
};

// 質問と判定ロジック（元ページから抽出）
const QUESTIONS = [
    {
        q: "後世に伝え残したい、あなたの「愛」の対象は？",
        a: [
            { text: "真理と本質を探求した『知の体系』", types: ['賢者', '職人'] },
            { text: "人々を魅了し、心を動かす『物語や思想』", types: ['魔術師', '共感者'] },
            { text: "世界を革新する、全く新しい『概念や技術』", types: ['開拓者', '錬金術師'] },
            { text: "人々が調和し、協力しあう『共同体』", types: ['調停者', '守護者'] }
        ]
    },
    {
        q: "あなたを最も奮い立たせるのは？",
        a: [
            { text: "手に入る『輝かしい理想の未来』のビジョン", types: ['開拓者', '魔術師'] },
            { text: "避けるべき『最悪の現実』を回避する戦略", types: ['守護者', '賢者'] },
            { text: "誰も見たことのないものを創り出す『創造のプロセス』", types: ['錬金術師', '職人'] },
            { text: "誰かの問題を解決し、貢献できる『感謝の言葉』", types: ['共感者', '調停者'] }
        ]
    },
    {
        q: "森を旅する時、心を奪われるのは？",
        a: [
            { text: "森全体を包む光や風といった『全体の雰囲気』", types: ['調停者', '魔術師'] },
            { text: "一枚の葉の葉脈、一匹の虫の動きといった『細部の神秘』", types: ['職人', '賢者'] },
            { text: "まだ誰も踏み入れたことのない『未知の小道』", types: ['開拓者', '錬金術師'] },
            { text: "共に旅する仲間との『穏やかな時間』", types: ['守護者', '共感者'] }
        ]
    },
    {
        q: "最高の達成感をもたらすのは？",
        a: [
            { text: "信頼する誰かからの『素晴らしい』という賞賛", types: ['共感者', '魔術師'] },
            { text: "自身の内なる声が告げる『完璧だ』という確信", types: ['職人', '賢者'] },
            { text: "困難な目標を『達成した』という客観的な事実", types: ['開拓者', '守護者'] },
            { text: "世界に『新たな価値』を生み出したという実感", types: ['錬金術師', '調停者'] }
        ]
    },
    {
        q: "変革を起こす時、より心を動かされるのは？",
        a: [
            { text: "一人のカリスマが道を切り拓く『英雄の物語』", types: ['開拓者', '魔術師'] },
            { text: "無数の人々が協力し合う『調和の物語』", types: ['調停者', '守護者'] },
            { text: "一つの完璧な製品が世界を変える『職人の物語』", types: ['職人', '錬金術師'] },
            { text: "一つの真実が人々を啓蒙する『賢者の物語』", types: ['賢者', '共感者'] }
        ]
    },
    {
        q: "チームで優先するのは？",
        a: [
            { text: "メンバーの感情に寄り添い『和』を保つこと", types: ['共感者', '調停者'] },
            { text: "目標達成という『任務』を最短で完了すること", types: ['守護者', '開拓者'] },
            { text: "最高のクオリティを追求し『傑作』を創ること", types: ['職人', '錬金術師'] },
            { text: "論理に基づき、最も『合理的』な判断を下すこと", types: ['賢者', '魔術師'] }
        ]
    },
    {
        q: "制約がなければ、時間を忘れて没頭するのは？",
        a: [
            { text: "複雑な問題を解き明かし、体系化すること", types: ['賢者', '調停者'] },
            { text: "人の相談に乗り、その人が笑顔になるのを見ること", types: ['共感者', '守護者'] },
            { text: "アイデアを試し、新しい何かを創造すること", types: ['錬金術師', '開拓者'] },
            { text: "一つの技術やスキルを、ひたすら磨き上げること", types: ['職人', '魔術師'] }
        ]
    }
];

// POST: 診断回答を受け取り、脳タイプを判定して保存
export async function POST(request: NextRequest) {
    try {
        const { answers } = await request.json();

        if (!answers || !Array.isArray(answers) || answers.length !== QUESTIONS.length) {
            return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
        }

        // タイプ判定: 各タイプのスコアを計算
        const scores: Record<string, number> = {};
        Object.keys(ARCHETYPES).forEach(type => scores[type] = 0);

        answers.forEach((answerIndex: number, questionIndex: number) => {
            const question = QUESTIONS[questionIndex];
            const answer = question.a[answerIndex];
            if (answer && answer.types) {
                answer.types.forEach((type: string) => {
                    if (scores[type] !== undefined) {
                        scores[type]++;
                    }
                });
            }
        });

        // 最高スコアのタイプを特定
        let maxScore = -1;
        let resultType = '';
        for (const type in scores) {
            if (scores[type] > maxScore) {
                maxScore = scores[type];
                resultType = type;
            }
        }

        const archetypeData = ARCHETYPES[resultType as keyof typeof ARCHETYPES];

        if (!archetypeData) {
            return NextResponse.json({ error: 'Failed to determine type' }, { status: 500 });
        }

        // 結果を返す（ログイン前なのでDBには保存しない）
        return NextResponse.json({
            success: true,
            result: {
                type: resultType,
                name: archetypeData.name,
                artwork: archetypeData.artwork,
                catchcopy: archetypeData.catchcopy,
                shadow: archetypeData.shadow,
                solution: archetypeData.solution
            }
        });
    } catch (error: any) {
        console.error('Diagnosis API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: ログイン後に診断結果をDBに保存
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const adminSupabase = await createAdminClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.error('PATCH /api/diagnosis: No user found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('PATCH /api/diagnosis: User ID:', user.id);

        const body = await request.json();
        const { type, shadow, solution } = body;

        console.log('PATCH /api/diagnosis: Received data:', { type, shadow: shadow?.substring(0, 50), solution: solution?.substring(0, 50) });

        if (!type) {
            console.error('PATCH /api/diagnosis: Type is missing');
            return NextResponse.json({ error: 'Type is required' }, { status: 400 });
        }

        // DBに保存（Service Role Keyで）
        const { error, data } = await adminSupabase
            .from('users')
            .update({
                oracle_type: type,
                oracle_shadow: shadow,
                oracle_solution: solution,
                diagnosis_completed_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select();

        if (error) {
            console.error('PATCH /api/diagnosis: DB Error:', JSON.stringify(error, null, 2));
            return NextResponse.json({
                error: 'Failed to save diagnosis',
                details: error.message,
                code: error.code
            }, { status: 500 });
        }

        console.log('PATCH /api/diagnosis: Success, updated rows:', data?.length || 0);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('PATCH /api/diagnosis: Exception:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

// GET: ユーザーの診断結果を取得
export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: userData } = await supabase
            .from('users')
            .select('oracle_type, oracle_shadow, oracle_solution, diagnosis_completed_at')
            .eq('id', user.id)
            .single();

        if (!userData || !userData.oracle_type) {
            return NextResponse.json({ success: true, hasDiagnosis: false });
        }

        const archetypeData = ARCHETYPES[userData.oracle_type as keyof typeof ARCHETYPES];

        return NextResponse.json({
            success: true,
            hasDiagnosis: true,
            result: {
                type: userData.oracle_type,
                name: archetypeData?.name || '',
                artwork: archetypeData?.artwork || '',
                catchcopy: archetypeData?.catchcopy || '',
                shadow: userData.oracle_shadow,
                solution: userData.oracle_solution,
                completedAt: userData.diagnosis_completed_at
            }
        });
    } catch (error: any) {
        console.error('Get Diagnosis API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export { ARCHETYPES, QUESTIONS };
