import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ptzuijpjmqogcvigvklv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0enVpanBqbXFvZ2N2aWd2a2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODExMDQsImV4cCI6MjA4MTk1NzEwNH0.SPBb2JdSkgWF5npR_E-K0FshikeCpYk5CWL6PhQUKzs";

/**
 * Create Supabase client for server-side use
 */
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });
}
