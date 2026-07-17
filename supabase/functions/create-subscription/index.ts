import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    const { plan } = await req.json()
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')
    
    // JWT decode to get the Clerk user ID
    const token = authHeader.replace('Bearer ', '')
    const payloadB64 = token.split('.')[1]
    const payload = JSON.parse(atob(payloadB64))
    const userId = payload.sub
    if (!userId) throw new Error('Invalid token format')

    const dodoApiKey = Deno.env.get('DODO_PAYMENTS_API_KEY')
    const productIdMonthly = Deno.env.get('DODO_PRODUCT_MONTHLY')
    const productIdYearly = Deno.env.get('DODO_PRODUCT_YEARLY')

    if (!dodoApiKey) throw new Error('Dodo Payments API Key not configured')

    const productId = plan === 'yearly' ? productIdYearly : productIdMonthly
    if (!productId) throw new Error(`Product ID for ${plan} plan not configured in environment variables`)

    const requestBody = {
      product_cart: [
        {
          product_id: productId,
          quantity: 1
        }
      ],
      return_url: req.headers.get('origin') + `/#/`,
      billing_currency: 'USD',
      metadata: {
        user_id: userId,
        type: 'subscription',
        plan: plan
      }
    };

    // Make request to Dodo Payments API
    const isLive = Deno.env.get('DODO_ENV') === 'live';
    const baseUrl = isLive ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';
    
    // Dodo Payments new API uses /payments for checkout links too
    const response = await fetch(`${baseUrl}/payments`, {
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
