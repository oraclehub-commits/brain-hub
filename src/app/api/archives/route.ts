import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch all archive items
export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: items, error } = await supabase
            .from('archives')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch archive items:', error);
            return NextResponse.json({ error: 'Failed to fetch archive items' }, { status: 500 });
        }

        return NextResponse.json({ success: true, items });
    } catch (error: any) {
        console.error('Archive API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add a new archive item
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, type, url, size } = await request.json();

        if (!title || !type) {
            return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
        }

        const { data: item, error } = await supabase
            .from('archives')
            .insert({
                user_id: user.id,
                title,
                type,
                url,
                size: size || '',
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to create archive item:', error);
            return NextResponse.json({ error: 'Failed to create archive item' }, { status: 500 });
        }

        return NextResponse.json({ success: true, item });
    } catch (error: any) {
        console.error('Create Archive API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete an archive item
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
            return NextResponse.json({ error: 'Archive item ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('archives')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Failed to delete archive item:', error);
            return NextResponse.json({ error: 'Failed to delete archive item' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete Archive API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
