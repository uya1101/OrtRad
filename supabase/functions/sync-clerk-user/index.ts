import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  Webhook,
  WebhookRequiredHeaders,
} from 'https://esm.sh/svix@1.26.1';

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

// Clerk webhook event types
type ClerkEventType = 'user.created' | 'user.updated' | 'user.deleted';

interface ClerkWebhookEvent {
  data: ClerkUser;
  type: ClerkEventType;
  object: 'event';
}

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
}

// Initialize Svix webhook verifier
let webhookVerifier: Webhook | null = null;

function getWebhookVerifier(): Webhook {
  if (!webhookVerifier) {
    if (!clerkWebhookSecret) {
      throw new Error('CLERK_WEBHOOK_SECRET is not configured');
    }
    webhookVerifier = new Webhook(clerkWebhookSecret);
  }
  return webhookVerifier;
}

// Extract primary email from Clerk user
function getPrimaryEmail(user: ClerkUser): string | null {
  const primaryEmail = user.email_addresses.find(
    (e) => e.id === user.primary_email_address_id
  ) || user.email_addresses[0];

  return primaryEmail?.email_address || null;
}

// Handle user creation
async function handleUserCreated(user: ClerkUser): Promise<boolean> {
  try {
    const email = getPrimaryEmail(user);
    if (!email) {
      console.error('No email found for user:', user.id);
      return false;
    }

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

    if (error) {
      console.error('Error inserting user:', error);
      return false;
    }

    console.log(`✓ User created: ${user.id}`);
    return true;
  } catch (error) {
    console.error('Error in handleUserCreated:', error);
    return false;
  }
}

// Handle user update
async function handleUserUpdated(user: ClerkUser): Promise<boolean> {
  try {
    const email = getPrimaryEmail(user);
    if (!email) {
      console.error('No email found for user:', user.id);
      return false;
    }

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

    if (error) {
      console.error('Error updating user:', error);
      return false;
    }

    console.log(`✓ User updated: ${user.id}`);
    return true;
  } catch (error) {
    console.error('Error in handleUserUpdated:', error);
    return false;
  }
}

// Handle user deletion
async function handleUserDeleted(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    console.log(`✓ User deleted: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in handleUserDeleted:', error);
    return false;
  }
}

serve(async (req) => {
  console.log('sync-clerk-user function invoked');

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract required headers for Svix verification
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    // Get payload
    const payload = await req.text();

    // Verify webhook signature using Svix
    try {
      const verifier = getWebhookVerifier();
      const headers: WebhookRequiredHeaders = {
        'svix-id': svixId || '',
        'svix-timestamp': svixTimestamp || '',
        'svix-signature': svixSignature || '',
      };
      verifier.verify(payload, headers);
      console.log('Webhook signature verified');
    } catch (error) {
      console.error('Invalid webhook signature:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid signature', details: String(error) }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse webhook event
    const event: ClerkWebhookEvent = JSON.parse(payload);
    console.log(`Received event: ${event.type} for user: ${event.data.id}`);

    let success = false;

    switch (event.type) {
      case 'user.created':
        success = await handleUserCreated(event.data);
        break;
      case 'user.updated':
        success = await handleUserUpdated(event.data);
        break;
      case 'user.deleted':
        success = await handleUserDeleted(event.data.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
        success = true; // Don't fail for unhandled events
    }

    if (success) {
      return new Response(
        JSON.stringify({ message: 'Webhook processed successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to process webhook' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in sync-clerk-user:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
