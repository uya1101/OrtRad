import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Webhook, WebhookRequiredHeaders } from 'npm:svix@1.21.0';

// Initialize Supabase client with service role
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const clerkWebhookSecret = Deno.env.get('CLERK_WEBHOOK_SECRET');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface ClerkUser {
  id: string;
  email_addresses: Array<{
    email_address: string;
    verification: {
      status: 'verified' | 'unverified' | 'expired';
    };
    id: string;
  }>;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  image_url: string | null;
  created_at: number;
  updated_at: number;
  public_metadata: Record<string, any>;
  private_metadata: Record<string, any>;
  unsafe_metadata: Record<string, any>;
  primary_email_address_id?: string;
}

// Extract primary email from Clerk user
function getPrimaryEmail(user: ClerkUser): string | null {
  const primaryEmail = user.email_addresses.find(
    (e) => e.id === user.primary_email_address_id
  ) || user.email_addresses[0];

  return primaryEmail?.email_address || null;
}

// Sync a single user to Supabase
async function syncUserToSupabase(user: ClerkUser): Promise<{ success: boolean; error?: string }> {
  try {
    const email = getPrimaryEmail(user);
    if (!email) {
      return { success: false, error: 'No email found' };
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', user.id)
      .single();

    if (existing) {
      // Update existing user
      const { error } = await supabase.from('users').update({
        email,
        email_verified: user.email_addresses.some(
          (e) => e.verification.status === 'verified'
        ),
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        image_url: user.image_url,
        updated_at: new Date(user.updated_at).toISOString(),
        public_metadata: user.public_metadata,
        private_metadata: user.private_metadata,
        unsafe_metadata: user.unsafe_metadata,
        last_synced_at: new Date().toISOString(),
      }).eq('id', user.id);

      if (error) throw error;
      console.log(`✓ Updated user: ${user.id}`);
      return { success: true };
    } else {
      // Insert new user
      const { error } = await supabase.from('users').insert({
        id: user.id,
        email,
        email_verified: user.email_addresses.some(
          (e) => e.verification.status === 'verified'
        ),
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        image_url: user.image_url,
        created_at: new Date(user.created_at).toISOString(),
        updated_at: new Date(user.updated_at).toISOString(),
        public_metadata: user.public_metadata,
        private_metadata: user.private_metadata,
        unsafe_metadata: user.unsafe_metadata,
        last_synced_at: new Date().toISOString(),
      });

      if (error) throw error;
      console.log(`✓ Created user: ${user.id}`);
      return { success: true };
    }
  } catch (error) {
    console.error(`Error syncing user ${user.id}:`, error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  console.log('sync-existing-users function invoked');

  try {
    // Verify authorization (optional for sync, but recommended for security)
    const authHeader = req.headers.get('authorization');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (authHeader !== `Bearer ${serviceKey}`) {
      console.log('No authorization provided, proceeding anyway (optional for sync)');
      // Continue anyway for sync operations
    }

    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { clerkApiKey, limit = 100 } = body;

    if (!clerkApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing clerkApiKey in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching users from Clerk...');

    // Fetch users from Clerk
    const clerkResponse = await fetch('https://api.clerk.com/v1/users', {
      headers: {
        'Authorization': `Bearer ${clerkApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!clerkResponse.ok) {
      const errorText = await clerkResponse.text();
      console.error('Failed to fetch Clerk users:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Clerk users', details: errorText }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const clerkUsers: ClerkUser[] = await clerkResponse.json();

    console.log(`Found ${clerkUsers.length} users in Clerk`);

    // Apply limit
    const usersToSync = clerkUsers.slice(0, limit);

    // Sync each user
    const results = {
      total: usersToSync.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: Array<{ userId: string; error: string }>(),
    };

    for (const user of usersToSync) {
      const { success, error } = await syncUserToSupabase(user);
      if (success) {
        // Check if it was created or updated
        const { data: existing } = await supabase
          .from('users')
          .select('created_at')
          .eq('id', user.id)
          .single();

        if (existing && existing.created_at === new Date(user.created_at).toISOString()) {
          results.created++;
        } else {
          results.updated++;
        }
      } else {
        results.failed++;
        results.errors.push({ userId: user.id, error: error || 'Unknown error' });
      }
    }

    console.log(`Sync completed: ${results.created} created, ${results.updated} updated, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        message: 'User sync completed',
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-existing-users:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
