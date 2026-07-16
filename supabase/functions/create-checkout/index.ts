import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    const { prompt_id } = await req.json()
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')
    
    // JWT decode to get the Clerk user ID
    const token = authHeader.replace('Bearer ', '')
    const payloadB64 = token.split('.')[1]
    const payload = JSON.parse(atob(payloadB64))
    const userId = payload.sub
    if (!userId) throw new Error('Invalid token format')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: prompt, error } = await supabase.from('prompts').select('*').eq('id', prompt_id).single()
    if (error || !prompt) throw new Error('Prompt not found')
    if (prompt.tier !== 'premium' || prompt.price <= 0) throw new Error('Not a premium prompt')

    // Check if already purchased
    const { data: existing } = await supabase.from('purchases').select('id').eq('prompt_id', prompt_id).eq('user_id', userId).maybeSingle()
    if (existing) throw new Error('Already purchased')

    const dodoApiKey = Deno.env.get('DODO_PAYMENTS_API_KEY')
    const productId = Deno.env.get('DODO_PRODUCT_ID')
    if (!dodoApiKey || !productId) throw new Error('Dodo Payments secrets not configured')

    // Option B: Dynamic price override for PWYW product
    const requestBody = {
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
          amount: Math.round(prompt.price * 100) // Dodo Payments expects cents, just like Stripe
        }
      ],
      return_url: req.headers.get('origin') + `/#/`,
      billing_currency: 'USD',
      metadata: {
        user_id: userId,
        prompt_id: prompt_id
      }
    };

    // Make request to Dodo Payments Checkout Sessions API
    const isLive = Deno.env.get('DODO_ENV') === 'live';
    const baseUrl = isLive ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';
    
    const response = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dodoApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Dodo error:', errText);
      throw new Error('Failed to create payment session with Dodo Payments');
    }

    const sessionData = await response.json();

    return new Response(JSON.stringify({ url: sessionData.payment_link || sessionData.checkout_url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders })
  }
})
