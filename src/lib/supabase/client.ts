import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const env = (import.meta as any).env;
  return createBrowserClient(
    env.VITE_SUPABASE_URL!,
    env.VITE_SUPABASE_PUBLISHABLE_KEY!
  )
}
