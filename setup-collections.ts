import { config } from 'dotenv';
import { Client } from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

config({ path: '.env' });

async function run() {
  let cn = process.env.POSTGRES_URL || '';
  if (cn.includes('&supa=')) {
     cn = cn.split('&supa=')[0];
  }
  
  const client = new Client({
    connectionString: cn,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      slug TEXT UNIQUE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow public read access on collections" ON collections;
    CREATE POLICY "Allow public read access on collections" ON collections FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Allow all on collections" ON collections;
    CREATE POLICY "Allow all on collections" ON collections FOR ALL USING (true) WITH CHECK (true);
  `);
  
  console.log("Success!");
  await client.end();
}

run().catch(console.error);
