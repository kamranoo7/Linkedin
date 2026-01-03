import { createClient } from "@supabase/supabase-js";

// Create React App requires process.env and REACT_APP_ prefix
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);