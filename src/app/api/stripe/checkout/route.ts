import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.quranmentorglobal.com'

// ── Helper: get or create billing profile ─────────────────────────────────────

async function getOrCreateBillingProfile(supabase: any, payerId: string, studentId: string, payerType: string) {
  // Try to find existing
  const { data: existing } = await supabase
    .from('billing_profiles')
    .select('*')
    .eq('payer_id', payerId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (existing) return { profile: existing, error: null }

  // Create new
  const { data: newProfile, error } = await supabase
    .from('billing_profiles')
    .insert({ payer_id: payerId, student_id: studentId, payer_type: payerType })
    .select('*')
    .single()

  return { profile: newProfile, error }
}

// ── Helper: get active commission rate ────────────────────────────────────────

async function getCommissionRate(supabase: any): Promise<{ id: string | null; rate: number }> {
  const { data } = await supabase
    .from('commission_rates')
    .select('id, rate_percent')
    .eq('applies_to', 'all')
    .is('effective_to', null)
    .order('effective_from', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { id: data?.id ?? null, rate: data?.rate_percent ?? 15 }
}

// ── POST /api/stripe/checkout ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { booking_id, amount_usd, description, payment_type = 'trial', student_id, package_id } = body

    if (!booking_id || !amount_usd) {
      return NextResponse.json({ error: 'booking_id and amount_usd are required' }, { status: 400 })
    }

    // ── Verify booking ────────────────────────────────────────────────────────
    const { data: booking, error: bookingErr } = await (supabase as any)
      .from('bookings')
      .select('id, student_id, teacher_id, course_id, price_usd, status, is_trial')
      .eq('id', booking_id)
      .single()

    if (bookingErr || !booking) {
      return NextResponse.json({ error: 'Booking not found: ' + (bookingErr?.message ?? '') }, { status: 404 })
    }

    if (booking.status !== 'pending') {
      return NextResponse.json({ error: `Booking status is "${booking.status}", expected "pending"` }, { status: 400 })
    }

    // ── Payer info ────────────────────────────────────────────────────────────
    const { data: payerProfile } = await (supabase as any)
      .from('profiles')
      .select('role, first_name, last_name, email')
      .eq('id', user.id)
      .single()

    const payerType = payerProfile?.role === 'parent' ? 'parent' : 'student'
    const actualStudentId = student_id || booking.student_id

    // ── Billing profile ───────────────────────────────────────────────────────
    const { profile: billingProfile, error: bpError } = await getOrCreateBillingProfile(
      supabase as any, user.id, actualStudentId, payerType
    )

    if (bpError || !billingProfile) {
      console.error('Billing profile error:', bpError)
      // Don't block payment if billing_profiles table doesn't exist yet
      // Fall through with null billing profile
    }

    // ── Commission ────────────────────────────────────────────────────────────
    const commission = await getCommissionRate(supabase as any)
    const grossAmount = parseFloat(amount_usd)
    const platformFee = Math.round(grossAmount * commission.rate / 100 * 100) / 100
    const teacherPayout = Math.round((grossAmount - platformFee) * 100) / 100

    // ── Idempotency key ───────────────────────────────────────────────────────
    // Use booking_id only (not timestamp) so retries reuse same key
    const idempotencyKey = `booking_${booking_id}_v1`

    // ── MOCK MODE ─────────────────────────────────────────────────────────────
    // Always use mock if no Stripe key configured
    if (!process.env.STRIPE_SECRET_KEY) {

      // Check if payment already exists for this booking (idempotency)
      const { data: existingPayment } = await (supabase as any)
        .from('payments')
        .select('id, status')
        .eq('booking_id', booking_id)
        .eq('provider', 'mock')
        .maybeSingle()

      if (existingPayment?.status === 'succeeded') {
        // Already paid — redirect to success
        return NextResponse.json({
          mode: 'mock',
          payment_id: existingPayment.id,
          redirect_url: `${APP_URL}/platform/student/bookings?payment=success&booking=${booking_id}`,
        })
      }

      // Build payment insert — only include billing_profile_id if we have it
      const paymentInsert: any = {
        student_id:         actualStudentId,
        teacher_id:         booking.teacher_id,
        booking_id:         booking_id,
        payer_type:         payerType,
        payer_id:           user.id,
        provider:           'mock',
        provider_payment_id: `mock_pi_${Date.now()}`,
        payment_type:       payment_type,
        gross_amount_usd:   grossAmount,
        platform_fee_usd:   platformFee,
        teacher_payout_usd: teacherPayout,
        commission_percent: commission.rate,
        status:             'succeeded',
        currency:           'USD',
        idempotency_key:    idempotencyKey,
        description:        description || 'Quran Lesson — Mock Payment',
        metadata:           { mode: 'mock', payer_id: user.id },
      }

      if (billingProfile?.id) paymentInsert.billing_profile_id = billingProfile.id
      if (commission.id)      paymentInsert.commission_rate_id  = commission.id
      if (package_id)         paymentInsert.package_id          = package_id

      const { data: payment, error: paymentErr } = await (supabase as any)
        .from('payments')
        .insert(paymentInsert)
        .select('id')
        .single()

      if (paymentErr || !payment) {
        console.error('Payment insert error:', paymentErr)
        return NextResponse.json({
          error: 'Failed to create payment record: ' + (paymentErr?.message ?? 'unknown error'),
        }, { status: 500 })
      }

      return NextResponse.json({
        mode: 'mock',
        payment_id: payment.id,
        redirect_url: `${APP_URL}/platform/student/bookings?payment=success&booking=${booking_id}`,
      })
    }

    // ── STRIPE MODE ───────────────────────────────────────────────────────────

    let stripe: any
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Stripe = require('stripe')
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
    } catch {
      return NextResponse.json({ error: 'Stripe package not installed. Run: npm install stripe' }, { status: 500 })
    }

    // Get or create Stripe customer
    let stripeCustomerId = billingProfile?.stripe_customer_id
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: payerProfile?.email || user.email,
        name: `${payerProfile?.first_name || ''} ${payerProfile?.last_name || ''}`.trim(),
        metadata: { payer_id: user.id, student_id: actualStudentId },
      })
      stripeCustomerId = customer.id
      if (billingProfile?.id) {
        await (supabase as any).from('billing_profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', billingProfile.id)
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(grossAmount * 100),
          product_data: {
            name: description || `Quran Lesson`,
            description: 'QuranMentorGlobal.com',
          },
        },
        quantity: 1,
      }],
      success_url: `${APP_URL}/platform/student/bookings?payment=success&booking=${booking_id}&session={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${APP_URL}/platform/teachers/${booking.teacher_id}/book?cancelled=true`,
      metadata: {
        booking_id,
        student_id: actualStudentId,
        teacher_id: booking.teacher_id,
        payer_id: user.id,
        payer_type: payerType,
        payment_type,
        idempotency_key: idempotencyKey,
      },
    })

    // Create pending payment
    const stripeInsert: any = {
      student_id:           actualStudentId,
      teacher_id:           booking.teacher_id,
      booking_id:           booking_id,
      payer_type:           payerType,
      payer_id:             user.id,
      provider:             'stripe',
      provider_payment_id:  session.payment_intent,
      provider_customer_id: stripeCustomerId,
      payment_type,
      gross_amount_usd:     grossAmount,
      platform_fee_usd:     platformFee,
      teacher_payout_usd:   teacherPayout,
      commission_percent:   commission.rate,
      status:               'pending',
      currency:             'USD',
      idempotency_key:      idempotencyKey,
      description:          description || 'Quran Lesson',
      metadata:             { stripe_session_id: session.id },
    }

    if (billingProfile?.id) stripeInsert.billing_profile_id = billingProfile.id
    if (commission.id)      stripeInsert.commission_rate_id  = commission.id

    await (supabase as any).from('payments').insert(stripeInsert)

    return NextResponse.json({ mode: 'stripe', checkout_url: session.url })

  } catch (err: any) {
    console.error('Checkout route error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
