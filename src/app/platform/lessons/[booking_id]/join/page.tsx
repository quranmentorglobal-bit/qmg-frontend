'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface LessonInfo {
  id: string
  scheduled_at: string
  duration_mins: number
  status: string
  daily_room_url: string | null
  teacher_first: string
  teacher_last: string
  student_first: string
  student_last: string
  course_title: string
  booking_id: string
}

// ── Countdown component ────────────────────────────────────────────────────────

function Countdown({ scheduledAt, onReady }: { scheduledAt: string; onReady: () => void }) {
  const [diff, setDiff] = useState(0)
  const firedRef = useRef(false)

  useEffect(() => {
    function update() {
      const ms = new Date(scheduledAt).getTime() - Date.now()
      setDiff(ms)
      if (ms <= 0 && !firedRef.current) {
        firedRef.current = true
        onReady()
      }
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [scheduledAt])

  if (diff <= 0) return null

  const totalSecs = Math.floor(diff / 1000)
  const days  = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const mins  = Math.floor((totalSecs % 3600) / 60)
  const secs  = totalSecs % 60

  return (
    <div className="flex gap-4 justify-center">
      {days > 0 && (
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            {days}
          </div>
          <div className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: '#8A9A8A' }}>Days</div>
        </div>
      )}
      {[
        { val: hours, label: 'Hours' },
        { val: mins,  label: 'Minutes' },
        { val: secs,  label: 'Seconds' },
      ].map(({ val, label }) => (
        <div key={label} className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{ background: '#0D3D20', color: '#D4AF50', fontFamily: "'Playfair Display', serif" }}
          >
            {String(val).padStart(2, '0')}
          </div>
          <div className="text-xs font-medium uppercase tracking-wider mt-2" style={{ color: '#8A9A8A' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function LessonJoinPage() {
  const params  = useParams()
  const router  = useRouter()
  const supabase = createClient()

  const bookingId = params.booking_id as string

  const [lesson, setLesson]     = useState<LessonInfo | null>(null)
  const [loading, setLoading]   = useState(true)
  const [myRole, setMyRole]     = useState<'student' | 'teacher'>('student')
  const [myId, setMyId]         = useState('')
  const [canJoin, setCanJoin]   = useState(false)
  const [joined, setJoined]     = useState(false)
  const [ending, setEnding]     = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/login'); return }
    setMyId(user.id)

    const { data: prof } = await (supabase as any)
      .from('profiles').select('role').eq('id', user.id).single()
    setMyRole(prof?.role === 'teacher' ? 'teacher' : 'student')

    // Load lesson
    const { data: lessons } = await (supabase as any)
      .from('lessons')
      .select(`
        id, scheduled_at, duration_mins, status, daily_room_url, booking_id,
        teacher:profiles!lessons_teacher_id_fkey(first_name, last_name),
        student:profiles!lessons_student_id_fkey(first_name, last_name),
        booking:bookings!lessons_booking_id_fkey(
          courses(title)
        )
      `)
      .eq('booking_id', bookingId)
      .order('scheduled_at', { ascending: true })
      .limit(1)

    if (!lessons || lessons.length === 0) {
      setLoading(false)
      return
    }

    const l = lessons[0]
    setLesson({
      id: l.id,
      scheduled_at: l.scheduled_at,
      duration_mins: l.duration_mins,
      status: l.status,
      daily_room_url: l.daily_room_url,
      teacher_first: l.teacher?.first_name || 'Teacher',
      teacher_last: l.teacher?.last_name || '',
      student_first: l.student?.first_name || 'Student',
      student_last: l.student?.last_name || '',
      course_title: l.booking?.courses?.title || 'Quran Lesson',
      booking_id: l.booking_id,
    })

    // Can join 15 mins before scheduled time
    const scheduledMs = new Date(l.scheduled_at).getTime()
    setCanJoin(Date.now() >= scheduledMs - 15 * 60 * 1000)
    setLoading(false)
  }

  function handleCountdownReady() {
    setCanJoin(true)
  }

  async function handleJoin() {
    if (!lesson?.daily_room_url) return
    setJoined(true)

    // Mark lesson as live
    if (myRole === 'teacher') {
      await (supabase as any)
        .from('lessons')
        .update({ status: 'live' })
        .eq('id', lesson.id)
    }
  }

  async function handleEndLesson() {
    if (!lesson) return
    setEnding(true)

    await (supabase as any).from('lessons').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', lesson.id)

    if (myRole === 'teacher') {
      await (supabase as any).from('bookings').update({ status: 'completed' }).eq('id', bookingId)
    }

    router.push(myRole === 'teacher'
      ? '/platform/teacher/bookings?ended=true'
      : '/platform/student/lessons?ended=true'
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D3D20' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 animate-spin mx-auto mb-4"
            style={{ borderColor: '#D4AF50', borderTopColor: 'transparent' }} />
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Loading lesson…</p>
        </div>
      </div>
    )
  }

  // ── No lesson found ────────────────────────────────────────────────────────

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F5F0E8' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Lesson not found
          </h2>
          <p className="text-sm mb-6" style={{ color: '#6B7A6B' }}>
            This lesson may not have been scheduled yet, or the booking hasn&apos;t been confirmed.
          </p>
          <Link href={myRole === 'teacher' ? '/platform/teacher/bookings' : '/platform/student/lessons'}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#1B5E37' }}>
            ← Back to {myRole === 'teacher' ? 'Bookings' : 'Lessons'}
          </Link>
        </div>
      </div>
    )
  }

  // ── In-call view ───────────────────────────────────────────────────────────

  if (joined && lesson.daily_room_url) {
    // Build Daily URL with display name
    const displayName = myRole === 'teacher'
      ? `${lesson.teacher_first} (Teacher)`
      : lesson.student_first

    const callUrl = lesson.daily_room_url.includes('?')
      ? `${lesson.daily_room_url}&username=${encodeURIComponent(displayName)}`
      : `${lesson.daily_room_url}?username=${encodeURIComponent(displayName)}`

    return (
      <div className="fixed inset-0 flex flex-col" style={{ background: '#0D0D0D' }}>
        {/* Call header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: '#0D3D20' }}>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="QMG" className="h-7 w-auto" />
            <div>
              <p className="text-sm font-semibold text-white">{lesson.course_title}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {myRole === 'teacher'
                  ? `with ${lesson.student_first} ${lesson.student_last}`
                  : `with ${lesson.teacher_first} ${lesson.teacher_last}`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full animate-pulse"
              style={{ background: 'rgba(34,197,94,0.2)', color: '#4ADE80' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Live
            </span>
            <button
              onClick={handleEndLesson}
              disabled={ending}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60"
              style={{ background: '#DC2626' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B91C1C' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#DC2626' }}
            >
              {ending ? 'Ending…' : '⏹ End Lesson'}
            </button>
          </div>
        </div>

        {/* Video iframe */}
        <iframe
          ref={iframeRef}
          src={callUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
          className="flex-1 w-full border-0"
          title="Quran Lesson Video Call"
        />
      </div>
    )
  }

  // ── Pre-join waiting room ──────────────────────────────────────────────────

  const scheduledDate = new Date(lesson.scheduled_at)
  const isToday = new Date().toDateString() === scheduledDate.toDateString()
  const formattedDate = scheduledDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formattedTime = scheduledDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0D3D20 0%, #1B5E37 50%, #0D3D20 100%)' }}>
      {/* Back link */}
      <div className="px-6 py-4">
        <Link
          href={myRole === 'teacher' ? '/platform/teacher/bookings' : '/platform/student/lessons'}
          className="text-sm font-medium flex items-center gap-2 w-fit"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          ← Back
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-8 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-lg">

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src="/logo.png" alt="QMG" className="h-10 w-auto" />
            <p className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Quran<span style={{ color: '#D4AF50' }}>Mentor</span>Global
            </p>
          </div>

          {/* Lesson card */}
          <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>

            {/* Course + participants */}
            <div className="px-8 py-7 text-center border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#D4AF50' }}>
                {myRole === 'teacher' ? 'Your Lesson' : 'Your Lesson'}
              </p>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {lesson.course_title}
              </h2>

              {/* Participants */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2"
                    style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)', color: '#fff' }}>
                    {lesson.teacher_first[0]}
                  </div>
                  <p className="text-xs font-semibold text-white">{lesson.teacher_first} {lesson.teacher_last}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Teacher</p>
                </div>

                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 24 }}>↔</div>

                <div className="text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2"
                    style={{ background: 'linear-gradient(135deg, #1B5E37, #2A7A4A)', color: '#fff' }}>
                    {lesson.student_first[0]}
                  </div>
                  <p className="text-xs font-semibold text-white">{lesson.student_first} {lesson.student_last}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Student</p>
                </div>
              </div>
            </div>

            {/* Schedule info */}
            <div className="px-8 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <span>📅</span>
                  <span>{isToday ? 'Today' : formattedDate}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <span>🕐</span>
                  <span>{formattedTime}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <span>⏱</span>
                  <span>{lesson.duration_mins} min</span>
                </div>
              </div>
            </div>

            {/* Countdown or Join */}
            <div className="px-8 py-8 text-center">
              {!canJoin ? (
                <>
                  <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Your lesson starts in:
                  </p>
                  <Countdown scheduledAt={lesson.scheduled_at} onReady={handleCountdownReady} />
                  <p className="text-xs mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Join button will appear 15 minutes before the lesson
                  </p>
                </>
              ) : (
                <>
                  {isToday && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ADE80' }} />
                      <span className="text-sm font-semibold" style={{ color: '#4ADE80' }}>
                        {lesson.status === 'live' ? 'Lesson is live!' : 'Ready to join'}
                      </span>
                    </div>
                  )}

                  {lesson.daily_room_url ? (
                    <button
                      onClick={handleJoin}
                      className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all mb-3"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(99,102,241,0.6)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(99,102,241,0.4)' }}
                    >
                      🎥 Join Lesson Now
                    </button>
                  ) : (
                    <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <p className="text-sm font-semibold" style={{ color: '#FCA5A5' }}>Video room not set up yet</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(252,165,165,0.7)' }}>
                        {myRole === 'student'
                          ? 'Please contact your teacher. The teacher needs to confirm your booking to activate the video room.'
                          : 'Go to Bookings and click "Confirm + Create Room" to set up the video call.'
                        }
                      </p>
                      {myRole === 'teacher' && (
                        <Link href="/platform/teacher/bookings"
                          className="inline-block mt-3 px-4 py-2 rounded-lg text-xs font-bold text-white"
                          style={{ background: '#DC2626' }}>
                          Go to Bookings
                        </Link>
                      )}
                    </div>
                  )}

                  <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Make sure your camera and microphone are enabled
                  </p>
                </>
              )}
            </div>

            {/* Tips */}
            <div className="px-8 pb-8">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Before you join:</p>
                <div className="space-y-1.5">
                  {[
                    'Have your Quran or learning materials ready',
                    'Find a quiet place with good lighting',
                    'Test your camera and microphone',
                    'Use headphones for better audio quality',
                  ].map(tip => (
                    <div key={tip} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5" style={{ color: '#D4AF50' }}>✓</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
