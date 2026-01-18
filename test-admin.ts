import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Testing connection to:', supabaseUrl);
console.log('Using Service Role Key (first 10 chars):', serviceRoleKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function test() {
    console.log('--- Listing all users from public.users ---');
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Count:', data.length);
        console.log('Data:', data);
    }
}

test();
