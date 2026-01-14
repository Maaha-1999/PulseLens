import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith("http")) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
  supabase = createClient("https://placeholder.supabase.co", "placeholder");
}

export { supabase };
