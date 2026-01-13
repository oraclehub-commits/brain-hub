import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createGeminiClient, SYSTEM_PROMPTS, generateWhisperPrompt } from '@/lib/ai/gemini';
import { detectStagnation, detectSuccess, generateWhisper } from '@/lib/sales/whisper';
import type { SubscriptionTier, Consultation } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's subscription tier
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('tier')
            .eq('user_id', user.id)
            .single();

        const tier: SubscriptionTier = subscription?.tier || 'FREE';

        // Get request body
        const { message, conversationHistory } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Get API key (use user's key if available, otherwise use server key)
        const { data: userData } = await supabase
            .from('users')
            .select('settings')
            .eq('id', user.id)
            .single();

        const apiKey = userData?.settings?.gemini_api_key || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Create Gemini client with appropriate model
        const model = createGeminiClient({ apiKey, tier });

        // Build conversation context
        const history = conversationHistory || [];
        const systemPrompt = SYSTEM_PROMPTS.oracle;

        // Fetch recent consultations for pattern detection
        const { data: recentConsultations } = await supabase
            .from('consultations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        // Detect patterns for sales triggers
        const stagnation = detectStagnation(recentConsultations || []);
        const isSuccess = detectSuccess([{ user_message: message } as Consultation]);

        // Determine whisper trigger
        let whisperTrigger: 'success' | 'stagnation' | 'completion' = 'completion';
        if (isSuccess) whisperTrigger = 'success';
        else if (stagnation) whisperTrigger = 'stagnation';

        // Generate whisper context
        const whisperContext = stagnation ? stagnation.message : message;
        const whisperPromptAddition = generateWhisperPrompt(whisperTrigger, whisperContext);

        // Build the full prompt
        const fullPrompt = `
${systemPrompt}

【過去の会話履歴】
${history.map((h: { role: string; content: string }) => `${h.role === 'user' ? 'ユーザー' : 'AI軍師'}: ${h.content}`).join('\n')}

【今回の相談】
${message}

【指示】
上記の相談に対して、AI軍師として回答してください。
回答の最後に、以下の形式で「軍師の独り言」を必ず追加してください。

---
💭 **軍師の独り言**
[ここに1-2文の独り言を入れる]
---

${whisperPromptAddition}
`;

        // Generate response
        const result = await model.generateContent(fullPrompt);
        const response = result.response.text();

        // Determine emotion tag based on message analysis
        let emotionTag = 'neutral';
        if (message.includes('不安') || message.includes('心配')) emotionTag = 'anxious';
        else if (message.includes('困') || message.includes('わからない')) emotionTag = 'confused';
        else if (message.includes('イライラ') || message.includes('うまくいかない')) emotionTag = 'frustrated';
        else if (message.includes('やりたい') || message.includes('目標')) emotionTag = 'hopeful';
        else if (isSuccess) emotionTag = 'excited';

        // Save consultation to database
        const { data: savedConsultation, error: saveError } = await supabase
            .from('consultations')
            .insert({
                user_id: user.id,
                user_message: message,
                ai_response: response,
                emotion_tag: emotionTag,
                sales_trigger: stagnation,
            })
            .select()
            .single();

        if (saveError) {
            console.error('Failed to save consultation:', saveError);
        }

        // Log behavior
        await supabase.from('behavior_logs').insert({
            user_id: user.id,
            action_type: 'consultation',
            payload: {
                consultation_id: savedConsultation?.id,
                emotion_tag: emotionTag,
                has_sales_trigger: !!stagnation,
            },
        });

        // Generate whisper for response
        const whisper = generateWhisper(whisperTrigger, stagnation?.intensity || 1);

        return NextResponse.json({
            success: true,
            data: {
                response,
                emotionTag,
                whisper,
                consultationId: savedConsultation?.id,
            },
        });

    } catch (error) {
        console.error('Consultation API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response' },
            { status: 500 }
        );
    }
}

// GET: Fetch consultation history
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const { data: consultations, error } = await supabase
            .from('consultations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch consultations' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: consultations,
        });

    } catch (error) {
        console.error('Fetch consultations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch consultations' },
            { status: 500 }
        );
    }
}
