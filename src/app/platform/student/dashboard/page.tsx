'use client'

import { useEffect, useState } from 'react'
import DashboardBanner from '@/components/platform/DashboardBanner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    isToday: new Date().toDateString() === d.toDateString(),
    isSoon: d.getTime() - Date.now() < 30 * 60 * 1000 && d.getTime() > Date.now(),
  }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#E8E4DA] ${className}`} />
}

// ── KPI Card — identical pattern to teacher dashboard ─────────────────────────

function KpiCard({ label, value, icon, gradient, iconBg, loading }: {
  label: string
  value: string | number
  icon: string
  gradient: string
  iconBg: string
  loading: boolean
}) {
  if (loading) return <Skeleton className="h-28" />
  return (
    <div
      className="rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-default"
      style={{ background: gradient, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.6)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
        style={{ background: iconBg, boxShadow: `0 4px 12px ${iconBg}55` }}>
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

// ── Quick Action — identical pattern to teacher dashboard ─────────────────────

function QuickAction({ icon, label, href, color }: { icon: string; label: string; href: string; color: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all duration-150"
      style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: color }}>
        {icon}
      </span>
      <span className="text-xs font-semibold" style={{ color: '#0D3D20' }}>{label}</span>
    </Link>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ emoji, title, sub, cta, ctaHref }: {
  emoji: string; title: string; sub: string; cta?: string; ctaHref?: string
}) {
  return (
    <div className="rounded-2xl p-10 text-center"
      style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(27,94,55,0.15)' }}>
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="font-semibold text-sm" style={{ color: '#1B5E37' }}>{title}</p>
      <p className="text-xs mt-1.5" style={{ color: '#8A9A8A' }}>{sub}</p>
      {cta && ctaHref && (
        <Link href={ctaHref}
          className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: '#1B5E37' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}>
          {cta}
        </Link>
      )}
    </div>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    confirmed: { bg: 'rgba(27,94,55,0.1)',    color: '#1B5E37',  label: 'Confirmed' },
    pending:   { bg: 'rgba(184,149,42,0.12)', color: '#B8952A',  label: 'Pending'   },
    completed: { bg: 'rgba(34,197,94,0.1)',   color: '#16A34A',  label: 'Completed' },
    cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626',  label: 'Cancelled' },
    active:    { bg: 'rgba(27,94,55,0.1)',    color: '#1B5E37',  label: 'Active'    },
  }
  const s = styles[status] ?? { bg: 'rgba(0,0,0,0.06)', color: '#666', label: status }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
      style={{ background: s.bg, color: s.color }}>
      {s.label.toUpperCase()}
    </span>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const supabase = createClient()
  const router   = useRouter()

  const [profile, setProfile]             = useState<any>(null)
  const [lessons, setLessons]             = useState<any[]>([])
  const [bookings, setBookings]           = useState<any[]>([])
  const [completedCount, setCompletedCount] = useState(0)
  const [loading, setLoading]             = useState(true)

  const greeting = getGreeting()

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) { router.replace('/auth/login'); return }

      const { data: profRaw } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, email, avatar_url, role')
        .eq('id', user.id)
        .single()

      const prof = profRaw as any
      if (prof) {
        setProfile(prof)
        if (prof.role === 'teacher') { router.replace('/platform/teacher/dashboard'); return }
      }

      const { data: myBookings } = await supabase
        .from('bookings')
        .select(`
          id, status, total_lessons, lessons_completed, student_id,
          courses ( title ),
          teacher_profiles (
            hourly_rate,
            profiles ( full_name, avatar_url )
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      setBookings(myBookings ?? [])

      const bookingIds = (myBookings ?? []).map((b: any) => b.id)

      if (bookingIds.length > 0) {
        const { data: upcomingLessons } = await supabase
          .from('lessons')
          .select(`
            id, scheduled_at, duration_mins, status, meeting_url, booking_id,
            bookings (
              courses ( title ),
              teacher_profiles ( profiles ( full_name, avatar_url ) )
            )
          `)
          .in('booking_id', bookingIds)
          .eq('status', 'scheduled')
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(10)

        setLessons(upcomingLessons ?? [])

        const { count } = await supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .in('booking_id', bookingIds)
          .eq('status', 'completed')

        setCompletedCount(count ?? 0)
      }

      setLoading(false)
    }
    load()
  }, [])

  const activeBookings = bookings.filter(b => b.status === 'confirmed')
  const firstName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Student'

  // ── KPI config ───────────────────────────────────────────────────────────────

  const kpiCards = [
    {
      label: 'Lessons Completed',
      value: completedCount,
      icon: '✅',
      gradient: 'linear-gradient(135deg, #E8F5EE 0%, #D4EDDA 100%)',
      iconBg: 'rgba(27,94,55,0.12)',
    },
    {
      label: 'Upcoming Lessons',
      value: lessons.length,
      icon: '📅',
      gradient: 'linear-gradient(135deg, #FFF8E8 0%, #FDEFC9 100%)',
      iconBg: 'rgba(184,149,42,0.12)',
    },
    {
      label: 'Active Bookings',
      value: activeBookings.length,
      icon: '📖',
      gradient: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
      iconBg: 'rgba(99,102,241,0.12)',
    },
    {
      label: 'My Teachers',
      value: bookings.length,
      icon: '🎓',
      gradient: 'linear-gradient(135deg, #F5F0FF 0%, #EDE9FE 100%)',
      iconBg: 'rgba(139,92,246,0.12)',
    },
  ]

  return (
    <div>

      {/* Greeting */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>
          {greeting}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
          {loading ? 'Welcome back' : `Welcome back, ${firstName}`} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>
          Here&apos;s what&apos;s happening with your learning today.
        </p>
      </div>

      {/* Hero Banner */}
      <DashboardBanner role="student" />

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
          <QuickAction icon="🔍" label="Browse Teachers"  href="/platform/teachers"          color="rgba(27,94,55,0.08)" />
          <QuickAction icon="📋" label="My Bookings"      href="/platform/student/bookings"   color="rgba(184,149,42,0.10)" />
          <QuickAction icon="📚" label="My Lessons"       href="/platform/student/lessons"    color="rgba(99,102,241,0.10)" />
          <QuickAction icon="👤" label="My Profile"       href="/platform/student/profile"    color="rgba(139,92,246,0.10)" />
        </div>
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Upcoming Lessons — 2 cols */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
              Upcoming Lessons
            </h2>
            <Link href="/platform/student/lessons" className="text-xs font-medium" style={{ color: '#1B5E37' }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
          ) : lessons.length === 0 ? (
            <EmptyState
              emoji="📚"
              title="No upcoming lessons"
              sub="Book a certified Qari to schedule your first lesson."
              cta="Browse Teachers"
              ctaHref="/platform/teachers"
            />
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson: any) => {
                const dt = formatDateTime(lesson.scheduled_at)
                const teacherName = lesson.bookings?.teacher_profiles?.profiles?.full_name ?? 'Teacher'
                const courseName  = lesson.bookings?.courses?.title ?? 'Quran Lesson'
                const avatarUrl   = lesson.bookings?.teacher_profiles?.profiles?.avatar_url

                return (
                  <div
                    key={lesson.id}
                    className="rounded-2xl p-4 flex items-center gap-4 transition-all"
                    style={{
                      background: '#fff',
                      border: dt.isSoon ? '1.5px solid #B8952A' : '1px solid rgba(27,94,55,0.08)',
                      boxShadow: dt.isSoon ? '0 4px 16px rgba(184,149,42,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = dt.isSoon ? '0 4px 16px rgba(184,149,42,0.15)' : '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    {/* Date chip */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #E8F5EE, #D4EDDA)', border: '1px solid rgba(27,94,55,0.12)' }}>
                      <span className="text-[9px] font-bold uppercase" style={{ color: 'rgba(27,94,55,0.5)' }}>
                        {dt.date.split(' ')[0]}
                      </span>
                      <span className="text-xl font-extrabold leading-none" style={{ color: '#0D3D20' }}>
                        {dt.date.split(' ')[1]}
                      </span>
                      <span className="text-[9px]" style={{ color: 'rgba(27,94,55,0.5)' }}>
                        {dt.date.split(' ')[2]}
                      </span>
                    </div>

                    {/* Teacher avatar */}
                    <div className="flex-shrink-0">
                      {avatarUrl
                        ? <img src={avatarUrl} alt={teacherName} className="w-10 h-10 rounded-full object-cover" />
                        : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ background: 'linear-gradient(135deg, #1B5E37, #2A7A4A)', color: '#fff' }}>
                            {getInitials(teacherName)}
                          </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm" style={{ color: '#0D3D20' }}>{courseName}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#6B7A6B' }}>with {teacherName}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs font-medium" style={{ color: '#5A7A6A' }}>{dt.time}</span>
                        <span style={{ color: '#C0C8C0' }}>·</span>
                        <span className="text-xs" style={{ color: '#8A9A8A' }}>{lesson.duration_mins} min</span>
                        {dt.isToday && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: 'rgba(27,94,55,0.1)', color: '#1B5E37' }}>TODAY</span>
                        )}
                        {dt.isSoon && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg animate-pulse"
                            style={{ background: 'rgba(184,149,42,0.15)', color: '#B8952A' }}>STARTING SOON</span>
                        )}
                      </div>
                    </div>

                    {/* Join button */}
                    {lesson.meeting_url && (dt.isToday || dt.isSoon) && (
                      <a
                        href={lesson.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
                        style={{ background: '#1B5E37' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
                      >
                        Join →
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column — My Teachers + Hadith */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
              My Teachers
            </h2>
            <Link href="/platform/student/bookings" className="text-xs font-medium" style={{ color: '#1B5E37' }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-24" />)}</div>
          ) : bookings.length === 0 ? (
            <EmptyState
              emoji="🎓"
              title="No teachers yet"
              sub="Find a certified Qari to start your journey."
              cta="Browse Teachers"
              ctaHref="/platform/teachers"
            />
          ) : (
            <div className="space-y-3">
              {bookings.map((booking: any) => {
                const teacherName = booking.teacher_profiles?.profiles?.full_name ?? 'Teacher'
                const courseName  = booking.courses?.title ?? 'Course'
                const avatarUrl   = booking.teacher_profiles?.profiles?.avatar_url
                const progress    = booking.total_lessons > 0
                  ? Math.round((booking.lessons_completed / booking.total_lessons) * 100) : 0

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl p-4 transition-all"
                    style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {avatarUrl
                        ? <img src={avatarUrl} alt={teacherName} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                        : (
                          <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #1B5E37, #2A7A4A)', color: '#fff' }}>
                            {getInitials(teacherName)}
                          </div>
                        )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-sm" style={{ color: '#0D3D20' }}>{teacherName}</p>
                        <p className="text-xs truncate mt-0.5" style={{ color: '#8A9A8A' }}>{courseName}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5" style={{ color: '#8A9A8A' }}>
                        <span>{booking.lessons_completed} of {booking.total_lessons} lessons</span>
                        <span style={{ color: '#1B5E37', fontWeight: 600 }}>{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F0EDE6' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #1B5E37, #B8952A)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Quranic reminder — same as teacher dashboard */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'linear-gradient(135deg, #0D3D20 0%, #1B5E37 100%)' }}
          >
            <p className="text-lg mb-2" style={{ fontFamily: "'Amiri', serif", color: '#D4AF50', direction: 'rtl' }}>
              خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              &ldquo;The best of you are those who learn the Quran and teach it.&rdquo;
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(212,175,80,0.6)' }}>— Sahih Al-Bukhari</p>
          </div>
        </div>

      </div>
    </div>
  )
}
