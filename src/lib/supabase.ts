import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vubictefeijicaokjhlh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1YmljdGVmZWlqaWNhb2tqaGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzkyMjQsImV4cCI6MjA3MjE1NTIyNH0.yAf92EBdP85Rm5t8bHRX6YBzXA8sLkI9_pd8cOuLIq4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for admin operations (use with caution)
export const supabaseAdmin = createClient(supabaseUrl, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1YmljdGVmZWlqaWNhb2tqaGxoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU3OTIyNCwiZXhwIjoyMDcyMTU1MjI0fQ.pSVL1jbVgppKwQlAi7YPFCuaAMwdUWB1enYRiiOM2mg");