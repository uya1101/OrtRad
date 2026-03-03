import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

serve(async (req) => {
  const serviceKey = Deno.env.get('SERVICE_ROLE_KEY') || 'NOT SET';
  const authHeader = req.headers.get('authorization') || 'NOT SET';
  
  // キーの末尾10文字だけ表示（安全のため）
  const envKeyTail = serviceKey.slice(-10);
  const authKeyTail = authHeader.replace('Bearer ', '').slice(-10);
  
  return new Response(JSON.stringify({
    env_key_tail: envKeyTail,
    auth_key_tail: authKeyTail,
    match: serviceKey === authHeader.replace('Bearer ', ''),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
