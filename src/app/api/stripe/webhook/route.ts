import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

let stripe: any = null
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe')
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
  }
} catch { /* stripe not installed */ }

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── Payment succeeded ─────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object
        const meta = session.metadata || {}

        if (session.payment_status === 'paid') {
          // Update payment to succeeded — trigger will handle the rest
          await supabaseAdmin
            .from('payments')
            .update({
              status: 'succeeded',
              provider_payment_id: session.payment_intent,
            })
            .eq('booking_id', meta.booking_id)
            .eq('status', 'pending')

          // Update payment attempt
          await supabaseAdmin
            .from('payment_attempts')
            .update({ status: 'succeeded' })
            .eq('provider_attempt_id', session.id)
        }
        break
      }

      // ── Payment intent succeeded (alternative event) ──────────────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object
        const meta = pi.metadata || {}

        await supabaseAdmin
          .from('payments')
          .update({ status: 'succeeded', provider_payment_id: pi.id })
          .eq('metadata->stripe_session_id', pi.id)
          .eq('status', 'pending')
        break
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const pi = event.data.object
        const failureMsg = pi.last_payment_error?.message || 'Payment failed'

        await supabaseAdmin
          .from('payments')
          .update({ status: 'failed' })
          .eq('provider_payment_id', pi.id)

        await supabaseAdmin
          .from('payment_attempts')
          .update({ status: 'failed', failure_message: failureMsg })
          .eq('provider_attempt_id', pi.id)
        break
      }

      // ── Subscription created ──────────────────────────────────────────────
      case 'customer.subscription.created': {
        const sub = event.data.object
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            stripe_subscription_id: sub.id,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── Subscription cancelled ────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── Charge refunded ───────────────────────────────────────────────────
      case 'charge.refunded': {
        const charge = event.data.object
        await supabaseAdmin
          .from('payments')
          .update({ status: 'refunded' })
          .eq('provider_payment_id', charge.payment_intent)

        await supabaseAdmin
          .from('refunds')
          .update({ status: 'completed', processed_at: new Date().toISOString(), provider_refund_id: charge.refunds?.data?.[0]?.id })
          .eq('payment_id', (await supabaseAdmin.from('payments').select('id').eq('provider_payment_id', charge.payment_intent).single()).data?.id)
        break
      }

      default:
        console.log(`Unhandled webhook event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
