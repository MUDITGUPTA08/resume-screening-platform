import { createClient, SupabaseClient } from '@supabase/supabase-js';

// No generated Database types for this take-home; dataStore.ts maps rows to
// typed records at the boundary, so `any` here is a deliberate, contained trade-off.
let client: SupabaseClient<any, any, any> | null = null;

export function getSupabaseClient(): SupabaseClient<any, any, any> {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  }

  client = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  return client;
}
