import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function check() {
  const { data, error } = await supabase.from('prompts').select('*').limit(1)
  console.log('Prompts table keys:', Object.keys(data[0] || {}))
  console.log('Sample data:', data[0])
}

check()
