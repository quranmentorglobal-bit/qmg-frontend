import { NextRequest, NextResponse } from 'next/server'

// Nothing at module level — all initialization happens inside the handler
// This prevents build-time crashes when env vars are missing

export async function POST(req: NextRequest) {
  // ── Lazy-load Stripe ───────────────────────────────────────────────────────
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    // Stripe not configured yet — silently accept and ignore
    return NextResponse.json({ received: true, mode: 'mock' })
  }

  let stripe: any
  try {
    const Stripe = require('stripe')
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
  } catch {
    return NextResponse.json({ error: 'Stripe package not installed. Run: npm install stripe' }, { status: 500 })
  }

  // ── Lazy-load Supabase admin client ────────────────────────────────────────
  const { createClient } = require('@supabase/supabase-js')
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── Verify Stripe signature ────────────────────────────────────────────────
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Handle events ──────────────────────────────────────────────────────────
  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object
        const meta = session.metadata || {}

        if (session.payment_status === 'paid') {
          await supabaseAdmin
            .from('payments')
            .update({ status: 'succeeded', provider_payment_id: session.payment_intent })
            .eq('booking_id', meta.booking_id)
            .eq('status', 'pending')

          await supabaseAdmin
            .from('payment_attempts')
            .update({ status: 'succeeded' })
            .eq('provider_attempt_id', session.id)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object
        await supabaseAdmin
          .from('payments')
          .update({ status: 'succeeded', provider_payment_id: pi.id })
          .eq('provider_payment_id', pi.id)
          .eq('status', 'pending')
        break
      }

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

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: sub.status === 'active' ? 'active' : 'past_due',
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        await supabaseAdmin
          .from('payments')
          .update({ status: 'refunded' })
          .eq('provider_payment_id', charge.payment_intent)
        break
      }

      default:
        // Ignore unhandled events
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
