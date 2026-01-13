import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch all sessions for the current user
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: sessions, error } = await supabase
            .from('oracle_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch sessions:', error);
            return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
        }

        return NextResponse.json({ sessions });
    } catch (error: any) {
        console.error('Sessions API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a session
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('oracle_sessions')
            .update({ archived: true })
            .eq('id', sessionId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Failed to delete session:', error);
            return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete Session API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
