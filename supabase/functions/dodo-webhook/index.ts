import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0"

serve(async (req) => {
  const signature = req.headers.get('webhook-signature')
  const webhookId = req.headers.get('webhook-id')
  const webhookTimestamp = req.headers.get('webhook-timestamp')

  if (!signature || !webhookId || !webhookTimestamp) {
    return new Response('Missing webhook signature headers', { status: 400 })
  }

  const payloadString = await req.text()
  const secret = Deno.env.get('DODO_WEBHOOK_SECRET') || ''

  try {
    const wh = new Webhook(secret)
    const event = wh.verify(payloadString, {
      "webhook-id": webhookId,
      "webhook-timestamp": webhookTimestamp,
      "webhook-signature": signature,
    }) as any;

    if (event.type === 'payment.succeeded') {
      const payment = event.data;
      const userId = payment.metadata?.user_id;
      const promptId = payment.metadata?.prompt_id;

      if (userId && promptId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        // Use SERVICE ROLE KEY to bypass RLS for inserts
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { error } = await supabase.from('purchases').upsert({
          user_id: userId,
          prompt_id: promptId
        }, { onConflict: 'user_id, prompt_id' })

        if (error) {
          console.error('Failed to grant access:', error)
          return new Response(JSON.stringify({ error: 'Database insert failed' }), { status: 500 })
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message)
    return new Response('Webhook signature verification failed', { status: 400 })
  }
})
