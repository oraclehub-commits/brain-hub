import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const adminSupabase = await createAdminClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, shadow, solution } = await request.json();

        if (!type) {
            return NextResponse.json({ error: 'Type is required' }, { status: 400 });
        }

        // DBに保存（Service Role Keyで）
        const { error } = await adminSupabase
            .from('users')
            .update({
                oracle_type: type,
                oracle_shadow: shadow,
                oracle_solution: solution,
                diagnosis_completed_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (error) {
            console.error('Failed to save diagnosis result:', error);
            return NextResponse.json({ error: 'Failed to save diagnosis' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Save Diagnosis Result API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
