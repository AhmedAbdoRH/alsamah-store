import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    console.log('Creating fresh Supabase client for:', supabaseUrl);
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      db: { 
        schema: 'public' 
      },
      global: { 
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    });
  }
  return supabaseClient;
};

export const supabase = getSupabaseClient();

// Force refresh function
export const refreshSupabaseClient = () => {
  supabaseClient = null;
  return getSupabaseClient();
};
