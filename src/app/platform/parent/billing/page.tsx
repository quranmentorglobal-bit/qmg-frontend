'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Invoice {
  id: string
  invoice_number: string
  status: string
  total_usd: number
  platform_fee_usd: number
  description: string | null
  paid_at: string | null
  issued_at: string | null
  created_at: string
  teacher_name?: string
  course_title?: string
  student_name?: string
}

interface PaymentSummary {
  totalSpent: number
  thisMonth: number
  invoiceCount: number
  activeChildren: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(usd: number) { return `$${usd.toFixed(2)}` }
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#EDE6D6] rounded-2xl ${className}`} />
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    paid:     { bg: 'rgba(27,94,55,0.1)',    color: '#1B5E37' },
    issued:   { bg: 'rgba(184,149,42,0.12)', color: '#B8952A' },
    void:     { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626' },
    overdue:  { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626' },
    draft:    { bg: 'rgba(0,0,0,0.06)',      color: '#666' },
  }
  const s = map[status] ?? map.draft
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase"
      style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

function KpiCard({ label, value, icon, gradient, loading }: {
  label: string; value: string; icon: string; gradient: string; loading: boolean
}) {
  if (loading) return <Skeleton className="h-28" />
  return (
    <div className="rounded-2xl p-5 flex flex-col justify-between transition-all duration-200"
      style={{ background: gradient, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.6)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
      <div className="text-2xl mb-3">{icon}</div>
      <div>
        <div className="text-2xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>{value}</div>
        <div className="text-xs font-medium mt-0.5" style={{ color: '#5A7A6A' }}>{label}</div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function ParentBillingPage() {
  const supabase = createClient()
  const [invoices, setInvoices]   = useState<Invoice[]>([])
  const [summary, setSummary]     = useState<PaymentSummary>({ totalSpent: 0, thisMonth: 0, invoiceCount: 0, activeChildren: 0 })
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<'all' | 'paid' | 'pending'>('all')

  useEffect(() => { loadBilling() }, [])

  async function loadBilling() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get billing profiles where this user is the payer
    const { data: bps } = await (supabase as any)
      .from('billing_profiles').select('id, student_id').eq('payer_id', user.id)

    const bpIds = (bps ?? []).map((b: any) => b.id)
    const studentIds = (bps ?? []).map((b: any) => b.student_id)

    if (bpIds.length === 0) { setLoading(false); return }

    // Get invoices
    const { data: rawInvoices } = await (supabase as any)
      .from('invoices')
      .select(`
        id, invoice_number, status, total_usd, platform_fee_usd,
        description, paid_at, issued_at, created_at,
        teacher:profiles!invoices_teacher_id_fkey(first_name, last_name),
        student:profiles!invoices_student_id_fkey(first_name, last_name)
      `)
      .in('billing_profile_id', bpIds)
      .order('created_at', { ascending: false })

    const inv: Invoice[] = (rawInvoices ?? []).map((i: any) => ({
      ...i,
      teacher_name: i.teacher ? `${i.teacher.first_name} ${i.teacher.last_name}` : 'Teacher',
      student_name: i.student ? `${i.student.first_name} ${i.student.last_name}` : 'Child',
    }))
    setInvoices(inv)

    // Summary
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
    const totalSpent = inv.filter(i => i.status === 'paid').reduce((s, i) => s + i.total_usd, 0)
    const thisMonth  = inv.filter(i => i.status === 'paid' && i.paid_at && new Date(i.paid_at) >= monthStart).reduce((s, i) => s + i.total_usd, 0)
    setSummary({ totalSpent, thisMonth, invoiceCount: inv.length, activeChildren: studentIds.length })
    setLoading(false)
  }

  const filtered = invoices.filter(i => {
    if (filter === 'paid')    return i.status === 'paid'
    if (filter === 'pending') return i.status !== 'paid'
    return true
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>Billing</p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Billing & Payments
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>
            View all invoices, payment history and manage your children&apos;s billing.
          </p>
        </div>
        <Link href="/platform/teachers"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all"
          style={{ background: '#1B5E37' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}>
          Book a Lesson
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Spent"       value={loading ? '—' : fmt(summary.totalSpent)} icon="💳" gradient="linear-gradient(135deg, #E8F5EE, #D4EDDA)" loading={loading} />
        <KpiCard label="This Month"        value={loading ? '—' : fmt(summary.thisMonth)}  icon="📅" gradient="linear-gradient(135deg, #FFF8E8, #FDEFC9)" loading={loading} />
        <KpiCard label="Total Invoices"    value={loading ? '—' : String(summary.invoiceCount)} icon="🧾" gradient="linear-gradient(135deg, #EEF2FF, #E0E7FF)" loading={loading} />
        <KpiCard label="Children Enrolled" value={loading ? '—' : String(summary.activeChildren)} icon="👨‍👩‍👧" gradient="linear-gradient(135deg, #F5F0FF, #EDE9FE)" loading={loading} />
      </div>

      {/* Info banner — mock mode */}
      <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <span className="text-xl flex-shrink-0">🧪</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#4338CA' }}>Test Mode Active</p>
          <p className="text-xs mt-0.5" style={{ color: '#6366F1' }}>
            No real payments are being processed. Stripe will be enabled before launch. All bookings and invoices are recorded exactly as they will be in production.
          </p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(27,94,55,0.07)', background: 'rgba(248,245,240,0.5)' }}>
          <h2 className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Invoice History
          </h2>
          <div className="flex gap-1 rounded-xl p-1" style={{ background: '#F5F0E8' }}>
            {(['all', 'paid', 'pending'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                style={filter === f
                  ? { background: '#1B5E37', color: '#fff' }
                  : { color: '#7A8A7A' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🧾</div>
            <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>No invoices yet</p>
            <p className="text-xs mt-1.5" style={{ color: '#9A9A8A' }}>Invoices appear automatically after each payment.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(27,94,55,0.05)' }}>
            {/* Column headers */}
            <div className="grid grid-cols-6 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide"
              style={{ color: '#9A9A8A', background: 'rgba(0,0,0,0.01)' }}>
              <span className="col-span-2">Invoice</span>
              <span>Child</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Status</span>
            </div>

            {filtered.map(inv => (
              <div key={inv.id}
                className="grid grid-cols-6 items-center px-6 py-4 transition-all"
                style={{ background: 'transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.02)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <div className="col-span-2">
                  <p className="text-sm font-semibold" style={{ color: '#0D3D20' }}>{inv.invoice_number}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9A9A8A' }}>
                    {inv.teacher_name} · {inv.description || 'Quran Lesson'}
                  </p>
                </div>
                <div className="text-sm" style={{ color: '#5A7A6A' }}>{inv.student_name}</div>
                <div className="text-sm font-bold" style={{ color: '#0D3D20' }}>{fmt(inv.total_usd)}</div>
                <div className="text-xs" style={{ color: '#8A9A8A' }}>{fmtDate(inv.paid_at || inv.created_at)}</div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment method placeholder */}
      <div className="mt-6 rounded-2xl p-5"
        style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Payment Method
          </h3>
          <span className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
            Coming Soon
          </span>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#F5F0E8', border: '1px dashed rgba(27,94,55,0.2)' }}>
          <span className="text-2xl">💳</span>
          <div>
            <p className="text-sm font-medium" style={{ color: '#0D3D20' }}>No payment method saved</p>
            <p className="text-xs mt-0.5" style={{ color: '#9A9A8A' }}>
              Stripe card management will be available before launch.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
