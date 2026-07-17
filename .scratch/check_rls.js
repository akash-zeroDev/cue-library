import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://fuslrenvonapcldxkgmm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.log("Please set SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('get_policies_for', { table_name: 'prompt_contents' });
  if (error) {
    console.log("RPC failed, trying raw query...", error.message);
    const { data: qData, error: qError } = await supabase.from('pg_policies').select('*').eq('tablename', 'prompt_contents');
    if (qError) {
      console.log("Raw query failed:", qError);
    } else {
      console.log(qData);
    }
  } else {
    console.log(data);
  }
}
check();
