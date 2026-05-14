import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as crypto from 'https://deno.land/std@0.168.0/node/crypto.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const signature = req.headers.get('x-paystack-signature');
  const bodyText = await req.text();
  
  let payload: any;
  try {
    payload = JSON.parse(bodyText);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (signature) {
    const hash = crypto.createHmac('sha512', paystackSecretKey).update(bodyText).digest('hex');
    if (hash !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  const event = payload.event;
  const data = payload.data;

  if (event === 'charge.success' || event === 'client_activation') {
    const reference = data.reference;
    const email = data.customer?.email;

    if (!reference || !email) {
      return new Response(JSON.stringify({ error: 'Missing reference or email' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${paystackSecretKey}` },
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.status || verifyData.data.status !== 'success') {
         return new Response(JSON.stringify({ error: 'Transaction verification failed' }), { 
           status: 400,
           headers: { ...corsHeaders, 'Content-Type': 'application/json' }
         });
      }

      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return new Response(JSON.stringify({ error: 'User not found' }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      const plan = payload.data.plan || 'essential'; 

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          subscription_plan: plan,
          subscription_status: 'active',
          payment_reference: reference,
          subscription_expires_at: expirationDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userData.id);

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Failed to update database' }), { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ message: 'Success' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Server error' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ message: 'Event ignored' }), { 
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
})
