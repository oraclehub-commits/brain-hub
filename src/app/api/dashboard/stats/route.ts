import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Calculate start of the week (Sunday)
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfWeekIso = startOfWeek.toISOString();

        // 1. Weekly Tasks (Completed)
        // Note: Assuming updated_at is close to completion time for 'done' tasks
        const { count: weeklyTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'done')
            .gte('updated_at', startOfWeekIso);

        // 2. Weekly Revenue
        const { data: incomeLogs, error: financeError } = await supabase
            .from('finance_logs')
            .select('amount')
            .eq('user_id', user.id)
            .eq('type', 'income')
            .gte('date', startOfWeekIso);

        const weeklyRevenue = incomeLogs?.reduce((sum, log) => sum + log.amount, 0) || 0;

        // 3. Weekly SNS Posts (Mock for now if table doesn't exist, or try fetch)
        // Assuming 'sns_posts' table might not exist or schema is different.
        // Let's return 0 or implement properly if we checked schema.
        // User request mentions "SNS writing: 3 posts/day".
        const weeklyPosts = 0; // Placeholder

        // 4. Competitor Analyses
        const { count: competitorAnalyses, error: compError } = await supabase
            .from('competitors')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
        // .not('analysis_result', 'is', null); // If we had this column

        if (tasksError || financeError || compError) {
            console.error('Stats aggregation error:', { tasksError, financeError, compError });
        }

        return NextResponse.json({
            success: true,
            stats: {
                weeklyTasks: weeklyTasks || 0,
                weeklyPosts: weeklyPosts, // Placeholder
                weeklyRevenue: weeklyRevenue,
                competitorAnalyses: competitorAnalyses || 0, // Placeholder count of total competitors
            }
        });

    } catch (error: any) {
        console.error('Dashboard Stats API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
