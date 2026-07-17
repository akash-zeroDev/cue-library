const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.fuslrenvonapcldxkgmm:545731da4902b2fb58a9dc6898aab95e212abcb91a1c5d1338ae168344c4b0ec@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
});
async function run() {
  await client.connect();
  const res = await client.query("SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'prompt_contents';");
  console.log(res.rows);
  await client.end();
}
run();
