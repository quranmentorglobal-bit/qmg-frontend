'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { CourseType } from '@/types/database'

const COURSE_TYPES: CourseType[] = ['Noorani Qaida', 'Tajweed', 'Hifz', 'Tafseer', 'Islamic Studies', 'Ijazah']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const COUNTRIES = ['Pakistan', 'United Kingdom', 'United States', 'UAE', 'Saudi Arabia', 'Canada', 'Australia', 'Other']

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[#E8E4DA] ${className}`} />
}

// ── Reusable input style ───────────────────────────────────────────────────────

const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
const inputStyle = {
  border: '1.5px solid #E0DDD5',
  fontFamily: "'DM Sans', sans-serif",
  color: '#1A1A1A',
  background: '#fff',
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5A6A5A' }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: '#9A9A8A' }}>{hint}</p>}
    </div>
  )
}

// ── Section card ───────────────────────────────────────────────────────────────

function Section({ title, subtitle, icon, children }: {
  title: string; subtitle?: string; icon: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      {/* Card header */}
      <div className="px-6 py-4 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(27,94,55,0.07)', background: 'rgba(248,245,240,0.5)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: 'rgba(27,94,55,0.08)' }}>
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>{title}</h2>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: '#8A9A8A' }}>{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function TeacherProfile() {
  const supabase = createClient()
  const router   = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState<string | null>(null)

  const [firstName, setFirstName]     = useState('')
  const [lastName, setLastName]       = useState('')
  const [email, setEmail]             = useState('')
  const [bio, setBio]                 = useState('')
  const [country, setCountry]         = useState('')
  const [phone, setPhone]             = useState('')
  const [hourlyRate, setHourlyRate]   = useState(15)
  const [trialRate, setTrialRate]     = useState(5)
  const [yearsExp, setYearsExp]       = useState(1)
  const [specializations, setSpecializations] = useState<CourseType[]>([])
  const [languages, setLanguages]     = useState('')
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [tpId, setTpId]               = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) {
        const p = prof as any
        setFirstName(p.first_name ?? '')
        setLastName(p.last_name ?? '')
        setEmail(p.email ?? '')
        setBio(p.bio ?? '')
        setCountry(p.country ?? '')
        setPhone(p.phone ?? '')
      }

      const { data: tp } = await supabase.from('teacher_profiles').select('*').eq('user_id', user.id).single()
      if (tp) {
        const t = tp as any
        setTpId(t.id)
        setHourlyRate(t.hourly_rate_usd ?? 15)
        setTrialRate(t.trial_rate_usd ?? 5)
        setYearsExp(t.years_experience ?? 1)
        setSpecializations(t.specializations ?? [])
        setLanguages((t.teaching_languages ?? []).join(', '))
        setAvailableDays(t.available_days ?? [])
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await (supabase.from('profiles') as any).update({
      first_name: firstName, last_name: lastName, bio, country, phone,
    }).eq('id', user.id)

    await (supabase.from('teacher_profiles') as any).update({
      hourly_rate_usd: hourlyRate,
      trial_rate_usd: trialRate,
      years_experience: yearsExp,
      specializations,
      teaching_languages: languages.split(',').map(l => l.trim()).filter(Boolean),
      available_days: availableDays,
    }).eq('id', tpId)

    setSaving(false)
    setToast('Profile saved successfully!')
    setTimeout(() => setToast(null), 3000)
  }

  function toggleSpec(spec: CourseType) {
    setSpecializations(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec])
  }

  function toggleDay(day: string) {
    setAvailableDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    (e.target as HTMLElement).style.borderColor = '#1B5E37'
    ;(e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(27,94,55,0.08)'
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    (e.target as HTMLElement).style.borderColor = '#E0DDD5'
    ;(e.target as HTMLElement).style.boxShadow = 'none'
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold"
          style={{ background: '#1B5E37', color: '#fff' }}>
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>
            Teacher Portal
          </p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            My Profile
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>
            Students see this page when browsing teachers. Keep it complete to get more bookings.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: '#1B5E37', boxShadow: '0 4px 12px rgba(27,94,55,0.25)' }}
          onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      {/* Profile completeness banner */}
      {!loading && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: 'rgba(184,149,42,0.08)', border: '1px solid rgba(184,149,42,0.2)' }}>
          <span className="text-xl flex-shrink-0">💡</span>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#7A6010' }}>Complete your profile to appear in search results</p>
            <p className="text-xs mt-0.5" style={{ color: '#8A7A30' }}>
              Add your bio, set your rates, choose your specializations and available days.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="text-xs font-bold" style={{ color: '#B8952A' }}>
              {[bio, country, phone, specializations.length > 0, availableDays.length > 0].filter(Boolean).length * 20}% complete
            </div>
            <div className="h-1.5 w-24 rounded-full mt-1" style={{ background: '#E0DDD5' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${[bio, country, phone, specializations.length > 0, availableDays.length > 0].filter(Boolean).length * 20}%`,
                background: 'linear-gradient(90deg, #B8952A, #D4AF50)',
              }} />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-5">{[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}</div>
      ) : (
        <div className="space-y-5">

          {/* ── Personal Information ── */}
          <Section title="Personal Information" subtitle="Your name and contact details" icon="👤">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name">
                <input value={firstName} onChange={e => setFirstName(e.target.value)}
                  className={inputCls} style={inputStyle} placeholder="Ahmed"
                  onFocus={focusStyle} onBlur={blurStyle} />
              </Field>
              <Field label="Last Name">
                <input value={lastName} onChange={e => setLastName(e.target.value)}
                  className={inputCls} style={inputStyle} placeholder="Khan"
                  onFocus={focusStyle} onBlur={blurStyle} />
              </Field>
              <Field label="Email">
                <input value={email} disabled className={inputCls}
                  style={{ ...inputStyle, background: '#F5F0E8', color: '#9A9A8A', cursor: 'not-allowed', border: '1.5px solid #E0DDD5' }} />
              </Field>
              <Field label="Phone / WhatsApp" hint="Students may contact you here for scheduling">
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className={inputCls} style={inputStyle} placeholder="+44 7700 000000"
                  onFocus={focusStyle} onBlur={blurStyle} />
              </Field>
              <Field label="Country">
                <select value={country} onChange={e => setCountry(e.target.value)}
                  className={inputCls} style={inputStyle}
                  onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Bio" hint="Tell students about your background, qualifications, and teaching style">
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                    placeholder="I am a certified Hafiz with 10+ years of teaching experience. I specialise in Tajweed and Hifz for all age groups..."
                    className={inputCls} style={{ ...inputStyle, resize: 'vertical' } as React.CSSProperties}
                    onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </div>
            </div>
          </Section>

          {/* ── Rates & Experience ── */}
          <Section title="Rates & Experience" subtitle="Set your pricing and teaching background" icon="💰">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Hourly Rate (USD)" hint="Per 60-min session">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: '#1B5E37' }}>$</span>
                  <input type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))}
                    className={inputCls} style={{ ...inputStyle, paddingLeft: 28 }} min="1"
                    onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </Field>
              <Field label="Trial Rate (USD)" hint="Free trial or discounted first lesson">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: '#B8952A' }}>$</span>
                  <input type="number" value={trialRate} onChange={e => setTrialRate(Number(e.target.value))}
                    className={inputCls} style={{ ...inputStyle, paddingLeft: 28 }} min="0"
                    onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </Field>
              <Field label="Years of Experience">
                <input type="number" value={yearsExp} onChange={e => setYearsExp(Number(e.target.value))}
                  className={inputCls} style={inputStyle} min="0" max="50"
                  onFocus={focusStyle} onBlur={blurStyle} />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Teaching Languages" hint="Comma separated — e.g. English, Urdu, Arabic">
                <input value={languages} onChange={e => setLanguages(e.target.value)}
                  className={inputCls} style={inputStyle} placeholder="English, Urdu, Arabic"
                  onFocus={focusStyle} onBlur={blurStyle} />
              </Field>
            </div>
          </Section>

          {/* ── Specializations ── */}
          <Section title="Specializations" subtitle="Which courses do you teach?" icon="📚">
            <div className="flex flex-wrap gap-2">
              {COURSE_TYPES.map(spec => (
                <button
                  key={spec}
                  onClick={() => toggleSpec(spec)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
                  style={specializations.includes(spec)
                    ? { background: '#1B5E37', color: '#fff', border: '1.5px solid #1B5E37', boxShadow: '0 4px 12px rgba(27,94,55,0.25)' }
                    : { background: '#fff', color: '#5A7A6A', border: '1.5px solid #E0DDD5' }
                  }
                  onMouseEnter={e => { if (!specializations.includes(spec)) (e.currentTarget as HTMLElement).style.borderColor = '#1B5E37' }}
                  onMouseLeave={e => { if (!specializations.includes(spec)) (e.currentTarget as HTMLElement).style.borderColor = '#E0DDD5' }}
                >
                  {spec}
                </button>
              ))}
            </div>
            {specializations.length === 0 && (
              <p className="text-xs mt-3" style={{ color: '#9A9A8A' }}>Select the courses you are qualified to teach.</p>
            )}
          </Section>

          {/* ── Availability ── */}
          <Section title="Available Days" subtitle="Which days are you available for lessons?" icon="📅">
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
                  style={availableDays.includes(day)
                    ? { background: '#B8952A', color: '#fff', border: '1.5px solid #B8952A', boxShadow: '0 4px 12px rgba(184,149,42,0.25)' }
                    : { background: '#fff', color: '#5A7A6A', border: '1.5px solid #E0DDD5' }
                  }
                  onMouseEnter={e => { if (!availableDays.includes(day)) (e.currentTarget as HTMLElement).style.borderColor = '#B8952A' }}
                  onMouseLeave={e => { if (!availableDays.includes(day)) (e.currentTarget as HTMLElement).style.borderColor = '#E0DDD5' }}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            {availableDays.length > 0 && (
              <p className="text-xs mt-3" style={{ color: '#1B5E37' }}>
                Available: {availableDays.join(', ')}
              </p>
            )}
          </Section>

          {/* ── Save Button (bottom) ── */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1B5E37, #0D3D20)', boxShadow: '0 4px 16px rgba(27,94,55,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(27,94,55,0.4)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(27,94,55,0.3)' }}
          >
            {saving ? 'Saving…' : '✓ Save Profile'}
          </button>

        </div>
      )}
    </div>
  )
}
