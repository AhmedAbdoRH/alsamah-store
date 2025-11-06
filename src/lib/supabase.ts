import { createClient } from '@supabase/supabase-js';

// Read from Vite env (define in .env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Do NOT expose service role in the browser. If needed, handle admin ops via server.