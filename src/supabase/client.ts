import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Отсутствуют VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY в файле .env или настройках окружения!'
    );
}

export const supabase = createClient(
    supabaseUrl || 'https://supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
