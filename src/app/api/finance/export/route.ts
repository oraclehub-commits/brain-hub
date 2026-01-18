import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ExportFactory } from '@/lib/export/ExportFactory';
import { ExportTransaction } from '@/lib/export/types';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { format } = await req.json(); // 'standard', 'yayoi', 'freee'

        const { data: logs, error } = await supabase
            .from('finance_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: true });

        if (error) throw error;

        // Use Factory to get strategy and generate CSV
        const strategy = ExportFactory.getStrategy(format);
        const csvContent = strategy.generateCSV(logs as ExportTransaction[]);

        return NextResponse.json({ success: true, csv: csvContent, filename: `finance_${format}_${Date.now()}.csv` });

    } catch (error: any) {
        console.error('Export API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
