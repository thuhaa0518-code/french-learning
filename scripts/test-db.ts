import { Client } from 'pg';

async function testConnection(url: string, name: string) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log(`[${name}] SUCCESS:`, res.rows[0]);
    await client.end();
    return true;
  } catch (err: any) {
    console.log(`[${name}] FAILED:`, err.message);
    return false;
  }
}

async function run() {
  const password = encodeURIComponent('Thuha@1810!');
  const projectRef = 'oogcmsouczrmbwughnfb';
  
  const urls = [
    { name: 'Pooler with pgbouncer=true', url: `postgresql://postgres.${projectRef}:${password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` },
    { name: 'Pooler with connection_limit=1', url: `postgresql://postgres.${projectRef}:${password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?connection_limit=1` }
  ];

  for (const config of urls) {
    await testConnection(config.url, config.name);
  }
}

run();
