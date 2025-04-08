// src/utils/supabaseClient.tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Type for the events table
export type Event = {
  id?: string;
  title: string;
  date?: string;
  time?: string;
  location: string;
  image?: string;
  dietary?: string[]; 
  description?: string;
  category?: string;
  spotsLeft?: number;
  created_at?: string;
  user_id: string; //  Link events to users
  user_name?: string; // Store user's name to display in the event details
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);