import { createClient } from '@supabase/supabase-js';

const env = import.meta.env;
const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Initialize with a dummy client if URL is missing to prevent total app crash
// Actual requests will fail, but the UI can at least render and show errors
export const supabase = supabaseUrl 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

if (!supabaseUrl) {
  console.warn("Supabase URL is missing. Please set VITE_SUPABASE_URL in your environment variables.");
}
