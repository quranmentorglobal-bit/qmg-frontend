'use client'

import { useEffect, useState } from 'react'
import DashboardBanner from '@/components/platform/DashboardBanner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Stats {
  totalStudents: number
  todayLessons: number
  pendingBookings: number
  monthlyEarnings: number
}

interface Booking {
  id: string
  student_first_name?: string
  student_last_name?: string
  course_title?: string
  start_date: string
  session_time: string
  status: string
  price_usd: number
  is_trial: boolean
  student_notes: string | null
}

interface Lesson {
  id: string
  scheduled_at: string
  status: string
  student_name: string
  course_title: string
  duration_mins: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#E8E4DA] ${className}`} />
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── KPI Card ───────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  gradient,
  iconColor,
  loading,
}: {
  label: string
  value: string | number
  icon: string
  gradient: string
  iconColor: string
  loading: boolean
}) {
  if (loading) return <Skeleton className="h-28" />
  return (
    <div
      className="rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-default"
      style={{
        background: gradient,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(255,255,255,0.6)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
        style={{ background: iconColor, boxShadow: `0 4px 12px ${iconColor}55` }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
          {value}
        </div>
        <div className="text-xs font-medium mt-0.5" style={{ color: '#5A7A6A' }}>{label}</div>
      </div>
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ emoji, title, sub, cta, ctaHref }: {
  emoji: string
  title: string
  sub: string
  cta?: string
  ctaHref?: string
}) {
  return (
    <div
      className="rounded-2xl p-10 text-center"
      style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(27,94,55,0.15)' }}
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="font-semibold text-sm" style={{ color: '#1B5E37' }}>{title}</p>
      <p className="text-xs mt-1.5" style={{ color: '#8A9A8A' }}>{sub}</p>
      {cta && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: '#1B5E37' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
        >
          {cta}
        </Link>
      )}
    </div>
  )
}

// ── Quick Action Button ────────────────────────────────────────────────────────

function QuickAction({ icon, label, href, color }: { icon: string; label: string; href: string; color: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all duration-150"
      style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: color }}
      >
        {icon}
      </span>
      <span className="text-xs font-semibold" style={{ color: '#0D3D20' }}>{label}</span>
    </Link>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function TeacherDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading]           = useState(true)
  const [teacherName, setTeacherName]   = useState('Teacher')
  const [stats, setStats]               = useState<Stats>({ totalStudents: 0, todayLessons: 0, pendingBookings: 0, monthlyEarnings: 0 })
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast]               = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const greeting = getGreeting()

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const teacherId = user.id
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    // Fetch teacher name
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()
    if (profile?.first_name) setTeacherName(profile.first_name)

    const [bookingsRes, lessonsRes, studentCountRes, todayCountRes, pendingCountRes, earningsRes] = await Promise.all([
      supabase.from('teacher_bookings_view').select('*').eq('teacher_id', teacherId).eq('status', 'pending').order('start_date', { ascending: true }),
      supabase.from('lessons').select('id, scheduled_at, status, duration_mins').eq('teacher_id', teacherId).in('status', ['scheduled', 'live']).gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(5),
      supabase.from('bookings').select('student_id', { count: 'exact', head: true }).eq('teacher_id', teacherId).eq('status', 'confirmed'),
      supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).gte('scheduled_at', `${today}T00:00:00`).lte('scheduled_at', `${today}T23:59:59`),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId).eq('status', 'pending'),
      supabase.from('payments').select('teacher_payout_usd').eq('teacher_id', teacherId).eq('status', 'succeeded').gte('created_at', monthStart),
    ])

    const monthlyEarnings = ((earningsRes.data as any) || []).reduce((sum: number, p: any) => sum + (p.teacher_payout_usd || 0), 0)

    setStats({
      totalStudents: studentCountRes.count || 0,
      todayLessons: todayCountRes.count || 0,
      pendingBookings: pendingCountRes.count || 0,
      monthlyEarnings,
    })
    setPendingBookings((bookingsRes.data as any) || [])
    setUpcomingLessons(
      ((lessonsRes.data as any) || []).map((l: any) => ({
        id: l.id, scheduled_at: l.scheduled_at, status: l.status,
        student_name: 'Student', course_title: 'Lesson', duration_mins: l.duration_mins,
      }))
    )
    setLoading(false)
  }

  async function handleBookingAction(bookingId: string, action: 'confirmed' | 'cancelled') {
    setActionLoading(bookingId + action)
    try {
      const updateData: any = { status: action }
      if (action === 'cancelled') updateData.cancel_reason = 'Declined by teacher'
      const { error } = await (supabase as any).from('bookings').update(updateData).eq('id', bookingId)
      if (error) throw error
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
      setStats(prev => ({ ...prev, pendingBookings: prev.pendingBookings - 1 }))
      showToast(action === 'confirmed' ? 'Booking confirmed!' : 'Booking declined.', 'success')
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const kpiCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      icon: '👨‍🎓',
      gradient: 'linear-gradient(135deg, #E8F5EE 0%, #D4EDDA 100%)',
      iconColor: 'rgba(27,94,55,0.12)',
    },
    {
      label: "Today's Lessons",
      value: stats.todayLessons,
      icon: '📖',
      gradient: 'linear-gradient(135deg, #FFF8E8 0%, #FDEFC9 100%)',
      iconColor: 'rgba(184,149,42,0.12)',
    },
    {
      label: 'Pending Requests',
      value: stats.pendingBookings,
      icon: '⏳',
      gradient: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
      iconColor: 'rgba(99,102,241,0.12)',
    },
    {
      label: 'Monthly Earnings',
      value: `$${stats.monthlyEarnings.toFixed(0)}`,
      icon: '💰',
      gradient: 'linear-gradient(135deg, #F5F0FF 0%, #EDE9FE 100%)',
      iconColor: 'rgba(139,92,246,0.12)',
    },
  ]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background: toast.type === 'success' ? '#1B5E37' : '#DC2626', color: '#fff' }}
        >
          {toast.message}
        </div>
      )}

      {/* Greeting */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>
          {greeting}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
          {loading ? 'Welcome back' : `Welcome back, ${teacherName}`} 🌙
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>
          Here&apos;s your teaching overview for today.
        </p>
      </div>

      {/* Hero Banner */}
      <DashboardBanner role="teacher" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map(card => (
          <KpiCard key={card.label} loading={loading} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-base font-bold mb-4" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon="📋" label="My Bookings" href="/platform/teacher/bookings" color="rgba(27,94,55,0.08)" />
          <QuickAction icon="📚" label="My Courses" href="/platform/teacher/courses" color="rgba(184,149,42,0.10)" />
          <QuickAction icon="🛡️" label="Verification" href="/platform/teacher/verification" color="rgba(99,102,241,0.10)" />
          <QuickAction icon="👤" label="My Profile" href="/platform/teacher/profile" color="rgba(139,92,246,0.10)" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Bookings — 2 cols */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
              Pending Booking Requests
              {pendingBookings.length > 0 && (
                <span
                  className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(184,149,42,0.12)', color: '#B8952A' }}
                >
                  {pendingBookings.length}
                </span>
              )}
            </h2>
            <Link href="/platform/teacher/bookings" className="text-xs font-medium" style={{ color: '#1B5E37' }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : pendingBookings.length === 0 ? (
            <EmptyState
              emoji="✅"
              title="No pending requests"
              sub="New booking requests from students will appear here."
            />
          ) : (
            <div className="space-y-3">
              {pendingBookings.map(booking => (
                <div
                  key={booking.id}
                  className="rounded-2xl p-5 transition-all"
                  style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: 'rgba(27,94,55,0.1)', color: '#1B5E37' }}
                      >
                        {(booking.student_first_name?.[0] ?? 'S').toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm" style={{ color: '#0D3D20' }}>
                            {booking.student_first_name
                              ? `${booking.student_first_name} ${booking.student_last_name || ''}`
                              : 'New Student'}
                          </span>
                          {booking.is_trial && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
                              FREE TRIAL
                            </span>
                          )}
                        </div>
                        <div className="text-xs" style={{ color: '#8A9A8A' }}>
                          {booking.course_title || 'Course'} · {formatDate(booking.start_date)} · {booking.session_time?.slice(0, 5)}
                        </div>
                        <div className="text-sm font-bold mt-1" style={{ color: '#1B5E37' }}>
                          ${booking.price_usd}
                        </div>
                        {booking.student_notes && (
                          <div className="text-xs mt-1 italic" style={{ color: '#A0A8A0' }}>
                            &ldquo;{booking.student_notes}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleBookingAction(booking.id, 'confirmed')}
                        disabled={actionLoading !== null}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                        style={{ background: '#1B5E37' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
                      >
                        {actionLoading === booking.id + 'confirmed' ? 'Accepting…' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleBookingAction(booking.id, 'cancelled')}
                        disabled={actionLoading !== null}
                        className="px-5 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-50"
                        style={{ borderColor: 'rgba(239,68,68,0.25)', color: '#DC2626' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        {actionLoading === booking.id + 'cancelled' ? 'Declining…' : 'Decline'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Lessons — 1 col */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
              Upcoming Lessons
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : upcomingLessons.length === 0 ? (
            <EmptyState
              emoji="📅"
              title="No upcoming lessons"
              sub="Confirmed bookings will generate lessons here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingLessons.map(lesson => (
                <div
                  key={lesson.id}
                  className="rounded-2xl p-4 flex items-center justify-between gap-3 transition-all"
                  style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: lesson.status === 'live' ? 'rgba(34,197,94,0.1)' : 'rgba(27,94,55,0.08)' }}
                    >
                      {lesson.status === 'live' ? '🔴' : '📅'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: '#0D3D20' }}>{lesson.student_name}</div>
                      <div className="text-xs" style={{ color: '#8A9A8A' }}>
                        {formatDate(lesson.scheduled_at)} · {formatTime(lesson.scheduled_at)}
                      </div>
                      <div className="text-xs" style={{ color: '#8A9A8A' }}>{lesson.duration_mins} min</div>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                    style={lesson.status === 'live'
                      ? { background: 'rgba(34,197,94,0.1)', color: '#16A34A' }
                      : { background: 'rgba(27,94,55,0.08)', color: '#1B5E37' }
                    }
                  >
                    {lesson.status === 'live' ? 'LIVE' : 'SOON'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quranic reminder */}
          <div
            className="mt-5 rounded-2xl p-5 text-center"
            style={{ background: 'linear-gradient(135deg, #0D3D20 0%, #1B5E37 100%)' }}
          >
            <p className="text-lg mb-2" style={{ fontFamily: "'Amiri', serif", color: '#D4AF50', direction: 'rtl' }}>
              خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              &ldquo;The best of you are those who learn the Quran and teach it.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
