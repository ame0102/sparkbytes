const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create a Supabase client with the service key for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;