import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://iiaktyujaliojfilgwfn.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpYWt0eXVqYWxpb2pmaWxnd2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDk4NzYsImV4cCI6MjA5NzAyNTg3Nn0.IbMvZs2ApY87AXHqi1IWdqGG-PcXp20MgFLYnbY8DYY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
