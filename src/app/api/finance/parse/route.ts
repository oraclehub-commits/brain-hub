import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/gemini/client';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
        }

        // AI Parsing Logic
        const prompt = `
      You are an expert accountant AI. Parse the following transaction text into structured JSON data.
      Today is: ${new Date().toISOString()}

      Text: "${text}"

      Rules:
      1. valid "type" values: "income" or "expense"
      2. "amount" must be a number
      3. "category" should be one of:
         - income: 売上, 雑収入, その他
         - expense: 仕入, 消耗品費, 旅費交通費, 通信費, 広告宣伝費, 地代家賃, 水道光熱費, 支払手数料, 外注工賃, 接待交際費, 会議費, 租税公課, 新聞図書費, 雑費
      4. "date" should be ISO 8601 format (YYYY-MM-DD). If not specified, use today.
      5. "description" should be the summary of the transaction (e.g. "Starbucks coffee").
      6. "transaction_partner" is the shop or person name if mentioned.

      Output JSON format:
      {
        "type": "expense" | "income",
        "amount": number,
        "category": string,
        "description": string,
        "date": string,
        "transaction_partner": string | null,
        "notes": string | null
      }

      Return ONLY the JSON.
    `;

        const aiResult = await generateContent(prompt);

        if (!aiResult.success || !aiResult.text) {
            return NextResponse.json({ error: 'Failed to parse transaction' }, { status: 500 });
        }

        // Clean up markdown block if present
        const cleanJson = aiResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        return NextResponse.json({ success: true, data: parsedData });

    } catch (error: any) {
        console.error('Parse API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
