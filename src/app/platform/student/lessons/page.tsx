'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CourseType } from '@/types/database'

const COURSE_ICONS: Record<CourseType, string> = {
  'Noorani Qaida':   '🔤',
  'Tajweed':         '🎵',
  'Hifz':            '📖',
  'Tafseer':         '🌙',
  'Islamic Studies': '☪️',
  'Ijazah':          '🏅',
}

function getInitials(first: string, last: string) {
  return `${(first[0] ?? '').toUpperCase()}${(last[0] ?? '').toUpperCase()}`
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#E8E4DA] ${className}`} />
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    scheduled: { bg: 'rgba(99,102,241,0.1)',  color: '#6366F1' },
    live:      { bg: 'rgba(34,197,94,0.15)',  color: '#16A34A' },
    completed: { bg: 'rgba(27,94,55,0.1)',    color: '#1B5E37' },
    cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626' },
    no_show:   { bg: 'rgba(0,0,0,0.06)',      color: '#666' },
  }
  const s = map[status] ?? map.no_show
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase"
      style={{ background: s.bg, color: s.color }}>
      {status.replace('_', ' ')}
    </span>
  )
}

const TABS = ['upcoming', 'completed', 'cancelled'] as const

export default function StudentLessons() {
  const supabase    = createClient()
  const router      = useRouter()
  const [lessons, setLessons]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('upcoming')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data: bookings } = await supabase.from('bookings').select('id').eq('student_id', user.id)
      const bookingIds = (bookings ?? []).map((b: any) => b.id)
      if (bookingIds.length === 0) { setLoading(false); return }

      const { data } = await supabase
        .from('lessons')
        .select(`
          id, scheduled_at, duration_mins, status,
          daily_room_url, teacher_notes, booking_id,
          bookings (
            courses ( title, course_type ),
            profiles!bookings_teacher_id_fkey ( first_name, last_name, avatar_url )
          )
        `)
        .in('booking_id', bookingIds)
        .order('scheduled_at', { ascending: false })

      setLessons((data as any) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()

  const filtered = lessons.filter(l => {
    const dt = new Date(l.scheduled_at)
    if (activeTab === 'upcoming')  return (l.status === 'scheduled' || l.status === 'live') && dt >= new Date(now.getTime() - 3600000)
    if (activeTab === 'completed') return l.status === 'completed'
    if (activeTab === 'cancelled') return l.status === 'cancelled' || l.status === 'no_show'
    return true
  })

  const upcomingCount  = lessons.filter(l => l.status === 'scheduled' || l.status === 'live').length
  const completedCount = lessons.filter(l => l.status === 'completed').length
  const cancelledCount = lessons.filter(l => l.status === 'cancelled' || l.status === 'no_show').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>
            Student Portal
          </p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            My Lessons
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>
            View and join your scheduled Quran lessons.
          </p>
        </div>
        <Link href="/platform/teachers"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all"
          style={{ background: '#1B5E37', boxShadow: '0 4px 12px rgba(27,94,55,0.25)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}>
          + Book Lesson
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Upcoming',  value: upcomingCount,  icon: '📅', gradient: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' },
          { label: 'Completed', value: completedCount, icon: '✅', gradient: 'linear-gradient(135deg, #E8F5EE, #D4EDDA)' },
          { label: 'Cancelled', value: cancelledCount, icon: '❌', gradient: 'linear-gradient(135deg, #FFF0F0, #FFE4E4)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center transition-all"
            style={{ background: s.gradient, border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
            <div className="text-xs font-medium mt-0.5" style={{ color: '#5A7A6A' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 rounded-2xl p-1 w-fit" style={{ background: '#F5F0E8' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
            style={activeTab === tab ? { background: '#1B5E37', color: '#fff' } : { color: '#7A8A7A' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Lessons */}
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-28" />)
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center"
            style={{ background: '#fff', border: '1px dashed rgba(27,94,55,0.15)' }}>
            <div className="text-5xl mb-3">
              {activeTab === 'upcoming' ? '📅' : activeTab === 'completed' ? '📚' : '❌'}
            </div>
            <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>No {activeTab} lessons</p>
            {activeTab === 'upcoming' && (
              <>
                <p className="text-xs mt-1.5 mb-5" style={{ color: '#9A9A8A' }}>
                  Book a teacher to schedule your first lesson.
                </p>
                <Link href="/platform/teachers"
                  className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#1B5E37' }}>
                  Browse Teachers
                </Link>
              </>
            )}
          </div>
        ) : filtered.map((l: any) => {
          const dt          = new Date(l.scheduled_at)
          const teacher     = l.bookings?.profiles
          const course      = l.bookings?.courses
          const courseType  = course?.course_type as CourseType
          const isToday     = new Date().toDateString() === dt.toDateString()
          const isSoon      = dt.getTime() - Date.now() < 30 * 60 * 1000 && dt.getTime() > Date.now()
          const canJoin     = Date.now() >= dt.getTime() - 15 * 60 * 1000
          const isLive      = l.status === 'live'

          return (
            <div
              key={l.id}
              className="rounded-2xl p-5 transition-all"
              style={{
                background: '#fff',
                border: isLive
                  ? '1.5px solid #1B5E37'
                  : isSoon
                  ? '1.5px solid #B8952A'
                  : '1px solid rgba(27,94,55,0.08)',
                boxShadow: isLive
                  ? '0 4px 20px rgba(27,94,55,0.15)'
                  : '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => { if (!isLive) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { if (!isLive) (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="flex flex-col sm:flex-row gap-4">

                {/* Date chip */}
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #E8F5EE, #D4EDDA)', border: '1px solid rgba(27,94,55,0.12)' }}>
                  <span className="text-[9px] font-bold uppercase" style={{ color: 'rgba(27,94,55,0.5)' }}>
                    {dt.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </span>
                  <span className="text-xl font-extrabold leading-none" style={{ color: '#0D3D20' }}>
                    {dt.getDate()}
                  </span>
                  <span className="text-[9px]" style={{ color: 'rgba(27,94,55,0.5)' }}>
                    {dt.toLocaleDateString('en-GB', { month: 'short' })}
                  </span>
                </div>

                {/* Teacher + course info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {teacher?.avatar_url ? (
                    <img src={teacher.avatar_url} alt={teacher.first_name}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1B5E37, #2A7A4A)', color: '#fff' }}>
                      {getInitials(teacher?.first_name ?? 'T', teacher?.last_name ?? '')}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-bold text-sm" style={{ color: '#0D3D20' }}>
                        {COURSE_ICONS[courseType] ?? '📖'} {course?.title}
                      </p>
                      {isLive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                          style={{ background: 'rgba(34,197,94,0.15)', color: '#16A34A' }}>
                          🔴 LIVE
                        </span>
                      )}
                      {isToday && !isLive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(27,94,55,0.1)', color: '#1B5E37' }}>
                          TODAY
                        </span>
                      )}
                      {isSoon && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                          style={{ background: 'rgba(184,149,42,0.15)', color: '#B8952A' }}>
                          STARTING SOON
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: '#6B7A6B' }}>
                      with {teacher?.first_name} {teacher?.last_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9A9A8A' }}>
                      {dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {l.duration_mins} min
                    </p>
                    {l.teacher_notes && (
                      <p className="text-xs mt-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(27,94,55,0.06)', color: '#1B5E37' }}>
                        📝 <span className="font-semibold">Teacher note:</span> {l.teacher_notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status + Join */}
                <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                  <StatusBadge status={l.status} />

                  {/* Join button — shows when can join */}
                  {(isLive || canJoin) && l.status !== 'completed' && l.status !== 'cancelled' && (
                    <Link
                      href={`/platform/lessons/${l.booking_id}/join`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                      style={{
                        background: isLive
                          ? 'linear-gradient(135deg, #16A34A, #1B5E37)'
                          : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        boxShadow: isLive
                          ? '0 4px 14px rgba(22,163,74,0.3)'
                          : '0 4px 14px rgba(99,102,241,0.3)',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                    >
                      🎥 {isLive ? 'Join Now' : 'Join Lesson'}
                    </Link>
                  )}

                  {/* Waiting state — too early */}
                  {!canJoin && l.status === 'scheduled' && (
                    <span className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: '#F5F0E8', color: '#9A9A8A' }}>
                      Opens 15 min before
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
