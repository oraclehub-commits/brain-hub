import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch all competitors
export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: competitors, error } = await supabase
            .from('competitors')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch competitors:', error);
            return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 });
        }

        return NextResponse.json({ success: true, competitors });
    } catch (error: any) {
        console.error('Competitors API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add a new competitor
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, platform, url } = await request.json();

        if (!name || !platform) {
            return NextResponse.json({ error: 'Name and platform are required' }, { status: 400 });
        }

        const { data: competitor, error } = await supabase
            .from('competitors')
            .insert({
                user_id: user.id,
                name,
                platform,
                url,
                followers: 0,
                engagement: 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to create competitor:', error);
            return NextResponse.json({ error: 'Failed to create competitor' }, { status: 500 });
        }

        return NextResponse.json({ success: true, competitor });
    } catch (error: any) {
        console.error('Create Competitor API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a competitor
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
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Competitor ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('competitors')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Failed to delete competitor:', error);
            return NextResponse.json({ error: 'Failed to delete competitor' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete Competitor API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
