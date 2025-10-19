import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase environment variables not found!");
  console.log("URL:", supabaseUrl);
  console.log("KEY:", supabaseKey ? "Ada" : "Tidak ada");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
