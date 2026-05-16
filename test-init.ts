import "dotenv/config";
import { config } from "dotenv";
config({ path: '.env' });
config({ path: '.env.local' });

// Log env details
console.log('SUP:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

import { createClient } from "@supabase/supabase-js";
try {
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string, 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string
  );
  console.log("Create client success.");
} catch (err: any) {
  console.log("Create client error:", err.message);
}
