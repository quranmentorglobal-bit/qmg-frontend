'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const COUNTRIES = [
  'Pakistan', 'United Kingdom', 'United States', 'UAE',
  'Saudi Arabia', 'Canada', 'Australia', 'Bangladesh',
  'India', 'Malaysia', 'Indonesia', 'Egypt', 'Other'
]

const TIMEZONES = [
  'Asia/Karachi', 'Europe/London', 'America/New_York', 'America/Chicago',
  'America/Los_Angeles', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Dhaka',
  'Asia/Kolkata', 'Asia/Kuala_Lumpur', 'Australia/Sydney', 'Africa/Cairo',
]

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-cream-dark ${className}`} />
}

export default function StudentProfile() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('')
  const [country, setCountry]     = useState('')
  const [timezone, setTimezone]   = useState('')
  const [bio, setBio]             = useState('')

  // Stats
  const [stats, setStats] = useState({ bookings: 0, lessons: 0, teachers: 0 })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      if (prof) {
        const p = prof as any
        setFirstName(p.first_name ?? '')
        setLastName(p.last_name ?? '')
        setEmail(p.email ?? '')
        setPhone(p.phone ?? '')
        setCountry(p.country ?? '')
        setTimezone(p.timezone ?? 'Asia/Karachi')
        setBio(p.bio ?? '')
      }

      // Stats
      const { count: bookingsCount } = await supabase
        .from('bookings').select('id', { count: 'exact', head: true })
        .eq('student_id', user.id)

      const { data: bookings } = await supabase
        .from('bookings').select('id').eq('student_id', user.id)

      const bookingIds = (bookings ?? []).map((b: any) => b.id)

      const { count: lessonsCount } = bookingIds.length > 0
        ? await supabase.from('lessons').select('id', { count: 'exact', head: true })
            .in('booking_id', bookingIds).eq('status', 'completed')
        : { count: 0 }

      const { count: teachersCount } = await supabase
        .from('bookings').select('teacher_id', { count: 'exact', head: true })
        .eq('student_id', user.id).eq('status', 'confirmed')

      setStats({
        bookings: bookingsCount ?? 0,
        lessons: lessonsCount ?? 0,
        teachers: teachersCount ?? 0,
      })

      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.')
      return
    }
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: updateError } = await (supabase.from('profiles') as any).update({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim() || null,
      country: country || null,
      timezone,
      bio: bio.trim() || null,
    }).eq('id', user.id)

    if (updateError) {
      setError('Failed to save. Please try again.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-green-dark">My Profile</h1>
          <p className="text-ink-light text-sm mt-1">Manage your personal information.</p>
        </div>
        {saved && (
          <div className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-semibold">
            ✓ Profile saved!
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Personal info */}
            <div className="bg-white rounded-2xl border border-gold/20 p-6">
              <h2 className="font-bold text-green-dark text-lg mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-green-dark mb-1">First Name *</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gold/30 text-sm text-ink focus:outline-none focus:border-green-DEFAULT transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-dark mb-1">Last Name *</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gold/30 text-sm text-ink focus:outline-none focus:border-green-DEFAULT transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-dark mb-1">Email</label>
                  <input value={email} disabled
                    className="w-full px-3 py-2.5 rounded-xl border border-gold/20 text-sm text-ink-light bg-cream cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-dark mb-1">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2.5 rounded-xl border border-gold/30 text-sm text-ink focus:outline-none focus:border-green-DEFAULT transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-dark mb-1">Country</label>
                  <select value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gold/30 text-sm text-ink focus:outline-none focus:border-green-DEFAULT transition-colors">
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-green-dark mb-1">Timezone</label>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gold/30 text-sm text-ink focus:outline-none focus:border-green-DEFAULT transition-colors">
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-green-dark mb-1">
                    About Me <span className="font-normal text-ink-light">(optional)</span>
                  </label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                    placeholder="Tell your teacher about your learning goals, experience level, age..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gold/30 text-sm text-ink focus:outline-none focus:border-green-DEFAULT transition-colors resize-none" />
                </div>
              </div>

              {error && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}

              <button onClick={handleSave} disabled={saving}
                className="mt-5 w-full bg-green-DEFAULT text-white py-3 rounded-xl font-bold text-sm hover:bg-green-dark transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* Right — sidebar */}
          <div className="space-y-4">

            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-gold/20 p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-green-DEFAULT flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-green-dark">{firstName} {lastName}</p>
              <p className="text-xs text-ink-light mt-0.5">{email}</p>
              <p className="text-xs text-ink-light capitalize mt-0.5">Student</p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gold/20 p-5">
              <h3 className="font-bold text-green-dark mb-4">My Journey</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Bookings',    value: stats.bookings, icon: '📅' },
                  { label: 'Lessons Completed', value: stats.lessons,  icon: '✅' },
                  { label: 'Teachers',          value: stats.teachers, icon: '👨‍🏫' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <span className="text-sm text-ink-light">{s.label}</span>
                    </div>
                    <span className="font-bold text-green-dark">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hadith */}
            <div className="bg-gradient-to-br from-green-DEFAULT to-green-dark rounded-2xl p-5 text-center">
              <p className="text-gold-DEFAULT text-lg font-bold mb-1" style={{ fontFamily: 'serif' }}>
                اقْرَأْ بِاسْمِ رَبِّكَ
              </p>
              <p className="text-white/70 text-xs">"Read in the name of your Lord"</p>
              <p className="text-gold-DEFAULT/60 text-[10px] mt-1">— Surah Al-Alaq 96:1</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
