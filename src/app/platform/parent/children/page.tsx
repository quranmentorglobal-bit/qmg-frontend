'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Child {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url: string | null
  country: string | null
}

const COUNTRIES = ['Pakistan', 'United Kingdom', 'United States', 'United Arab Emirates', 'Saudi Arabia', 'Canada', 'Australia', 'Other']
const QURAN_LEVELS = ['Complete Beginner', 'Learning Qaida', 'Reading Quran (Nazra)', 'Learning Tajweed', 'Memorising (Hifz)', 'Advanced']

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#EDE6D6] rounded-xl ${className}`} />
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1.5px solid #E0DDD5',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: '#1A1A1A',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s',
} as React.CSSProperties

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#5A6A5A',
  marginBottom: 5,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

// ── Add Child Modal ────────────────────────────────────────────────────────────

function AddChildModal({ onClose, onSuccess, parentId, existingChildIds }: {
  onClose: () => void
  onSuccess: (child: Child) => void
  parentId: string
  existingChildIds: string[]
}) {
  const supabase = createClient()

  // 'choose' = pick mode, 'link' = link existing, 'create' = new account
  const [mode, setMode]       = useState<'choose' | 'link' | 'create'>('choose')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  // Link existing state
  const [linkEmail, setLinkEmail]       = useState('')
  const [foundChild, setFoundChild]     = useState<Child | null>(null)
  const [searching, setSearching]       = useState(false)

  // Create new state
  const [step, setStep]   = useState<1 | 2>(1)
  const [form, setForm]   = useState({
    first_name: '', last_name: '', email: '', password: '',
    age: '', country: '', gender: '', quran_level: '', notes: '',
  })

  function setField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  // ── LINK EXISTING: search by email ──────────────────────────────────────────

  async function searchByEmail() {
    if (!linkEmail.trim() || !linkEmail.includes('@')) {
      setError('Enter a valid email address'); return
    }
    setSearching(true)
    setError('')
    setFoundChild(null)

    const { data, error: err } = await (supabase as any)
      .from('profiles')
      .select('id, first_name, last_name, email, avatar_url, country, role')
      .eq('email', linkEmail.trim().toLowerCase())
      .single()

    setSearching(false)

    if (err || !data) {
      setError('No account found with that email. Check the email or create a new account instead.')
      return
    }
    if (data.role !== 'student') {
      setError('This account is not a student account. Only student accounts can be linked as children.')
      return
    }
    if (existingChildIds.includes(data.id)) {
      setError('This child is already linked to your account.')
      return
    }
    setFoundChild(data as Child)
  }

  async function handleLink() {
    if (!foundChild) return
    setSaving(true)
    setError('')
    try {
      const { error: linkErr } = await (supabase as any)
        .from('parent_children')
        .insert({ parent_id: parentId, child_id: foundChild.id })
      if (linkErr) throw new Error(linkErr.message)
      onSuccess(foundChild)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  // ── CREATE NEW ───────────────────────────────────────────────────────────────

  function validateStep1() {
    if (!form.first_name.trim()) return 'First name is required'
    if (!form.last_name.trim())  return 'Last name is required'
    if (!form.email.trim() || !form.email.includes('@')) return 'Enter a valid email'
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  function nextStep() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setStep(2)
  }

  async function handleCreate() {
    setSaving(true)
    setError('')
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            role: 'student',
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
          },
        },
      })
      if (signUpError) throw new Error(signUpError.message)
      const childUserId = signUpData.user?.id
      if (!childUserId) throw new Error('Failed to create account')

      await new Promise(r => setTimeout(r, 800))

      await (supabase as any).from('profiles').update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        country: form.country || null,
      }).eq('id', childUserId)

      const { error: linkError } = await (supabase as any)
        .from('parent_children')
        .insert({ parent_id: parentId, child_id: childUserId })
      if (linkError) throw new Error(linkError.message)

      onSuccess({
        id: childUserId,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        avatar_url: null,
        country: form.country || null,
      })
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #0D3D20, #1B5E37)' }}
        >
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Add a Child
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {mode === 'choose' && 'Choose how to add your child'}
              {mode === 'link'   && 'Link an existing student account'}
              {mode === 'create' && `Create a new account — Step ${step} of 2`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
          >✕</button>
        </div>

        {/* ── CHOOSE MODE ── */}
        {mode === 'choose' && (
          <div className="p-6 space-y-4">
            <p className="text-sm" style={{ color: '#6B7A6B' }}>
              Does your child already have a QuranMentorGlobal student account, or do you need to create one?
            </p>

            {/* Option A — link existing */}
            <button
              onClick={() => { setMode('link'); setError('') }}
              className="w-full rounded-2xl p-5 text-left transition-all"
              style={{ background: '#F5F0E8', border: '2px solid transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1B5E37' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: 'rgba(27,94,55,0.1)' }}>
                  🔗
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>
                    Link existing account
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#7A8A7A' }}>
                    My child already signed up as a student. I want to link their existing account to my parent profile.
                  </p>
                </div>
              </div>
            </button>

            {/* Option B — create new */}
            <button
              onClick={() => { setMode('create'); setError('') }}
              className="w-full rounded-2xl p-5 text-left transition-all"
              style={{ background: '#F5F0E8', border: '2px solid transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#B8952A' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: 'rgba(184,149,42,0.1)' }}>
                  ✨
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>
                    Create new account
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#7A8A7A' }}>
                    My child does not have an account yet. I will create one for them now.
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ── LINK EXISTING ── */}
        {mode === 'link' && (
          <div className="p-6 space-y-5">
            <div
              className="rounded-xl p-4 flex gap-3"
              style={{ background: 'rgba(27,94,55,0.06)', border: '1px solid rgba(27,94,55,0.12)' }}
            >
              <span className="text-lg flex-shrink-0">ℹ️</span>
              <p className="text-xs" style={{ color: '#3A5A3A' }}>
                Enter the email address your child used when they signed up as a student. We&apos;ll find their account and link it to yours.
              </p>
            </div>

            <div>
              <label style={labelStyle}>Child&apos;s Email Address *</label>
              <div className="flex gap-2">
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  type="email"
                  placeholder="childs-email@example.com"
                  value={linkEmail}
                  onChange={e => { setLinkEmail(e.target.value); setError(''); setFoundChild(null) }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }}
                  onKeyDown={e => { if (e.key === 'Enter') searchByEmail() }}
                />
                <button
                  onClick={searchByEmail}
                  disabled={searching}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all disabled:opacity-60"
                  style={{ background: '#1B5E37' }}
                  onMouseEnter={e => { if (!searching) (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
                >
                  {searching ? '…' : 'Find'}
                </button>
              </div>
            </div>

            {/* Found result */}
            {foundChild && (
              <div
                className="rounded-xl p-4 flex items-center gap-4"
                style={{ background: 'rgba(27,94,55,0.06)', border: '1.5px solid #1B5E37' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1B5E37, #2A7A4A)', color: '#fff' }}
                >
                  {getInitials(foundChild.first_name, foundChild.last_name)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>
                    {foundChild.first_name} {foundChild.last_name}
                  </p>
                  <p className="text-xs" style={{ color: '#7A8A7A' }}>{foundChild.email}</p>
                  {foundChild.country && (
                    <p className="text-xs mt-0.5" style={{ color: '#7A8A7A' }}>{foundChild.country}</p>
                  )}
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(27,94,55,0.1)', color: '#1B5E37' }}>
                  Found ✓
                </span>
              </div>
            )}

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE NEW — Step 1 ── */}
        {mode === 'create' && step === 1 && (
          <div className="px-6 py-4 space-y-4">
            {/* Step bar */}
            <div className="flex gap-2 mb-2">
              {[1, 2].map(n => (
                <div key={n} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{ background: n <= step ? '#1B5E37' : '#E0DDD5' }} />
              ))}
            </div>

            <p className="text-sm" style={{ color: '#6B7A6B' }}>
              Create a student login account for your child.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>First Name *</label>
                <input style={inputStyle} placeholder="Ahmed" value={form.first_name}
                  onChange={e => setField('first_name', e.target.value)}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }} />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input style={inputStyle} placeholder="Khan" value={form.last_name}
                  onChange={e => setField('last_name', e.target.value)}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Child&apos;s Email *</label>
              <input style={inputStyle} type="email" placeholder="ahmed@example.com" value={form.email}
                onChange={e => setField('email', e.target.value)}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }} />
              <p className="text-xs mt-1" style={{ color: '#9A9A8A' }}>Must be unique — can be a family email with +child suffix e.g. parent+ahmed@gmail.com</p>
            </div>

            <div>
              <label style={labelStyle}>Password *</label>
              <input style={inputStyle} type="password" placeholder="Minimum 6 characters" value={form.password}
                onChange={e => setField('password', e.target.value)}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }} />
            </div>

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>
            )}
          </div>
        )}

        {/* ── CREATE NEW — Step 2 ── */}
        {mode === 'create' && step === 2 && (
          <div className="px-6 py-4 space-y-4">
            <div className="flex gap-2 mb-2">
              {[1, 2].map(n => (
                <div key={n} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{ background: n <= step ? '#1B5E37' : '#E0DDD5' }} />
              ))}
            </div>

            <p className="text-sm" style={{ color: '#6B7A6B' }}>Help us match your child with the right teacher.</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Age</label>
                <input style={inputStyle} type="number" placeholder="e.g. 8" min="3" max="18" value={form.age}
                  onChange={e => setField('age', e.target.value)}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }} />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select style={inputStyle} value={form.gender} onChange={e => setField('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Country</label>
              <select style={inputStyle} value={form.country} onChange={e => setField('country', e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Current Quran Level</label>
              <select style={inputStyle} value={form.quran_level} onChange={e => setField('quran_level', e.target.value)}>
                <option value="">Select level</option>
                {QURAN_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Notes for Teacher <span style={{ color: '#B8B8A8', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                style={{ ...inputStyle, minHeight: 75, resize: 'vertical' } as React.CSSProperties}
                placeholder="e.g. Memorised Juz Amma, needs help with Tajweed..."
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#1B5E37' }}
                onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#E0DDD5' }}
              />
            </div>

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>{error}</div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: '1px solid #F0EDE6' }}>
          {/* Back button */}
          <button
            onClick={() => {
              if (mode === 'link' || mode === 'create') { setMode('choose'); setStep(1); setError(''); setFoundChild(null) }
              else if (step === 2) setStep(1)
            }}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: '#F5F0E8', color: '#1B5E37' }}
          >
            ← Back
          </button>

          <div className="flex-1" />

          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ color: '#9A9A8A' }}>
            Cancel
          </button>

          {/* Primary action */}
          {mode === 'choose' && null}

          {mode === 'link' && (
            <button
              onClick={handleLink}
              disabled={!foundChild || saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: '#1B5E37' }}
              onMouseEnter={e => { if (foundChild && !saving) (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
            >
              {saving ? 'Linking…' : 'Link Child ✓'}
            </button>
          )}

          {mode === 'create' && step === 1 && (
            <button
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: '#1B5E37' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
            >
              Next →
            </button>
          )}

          {mode === 'create' && step === 2 && (
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: '#1B5E37' }}
              onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
            >
              {saving ? 'Creating…' : 'Add Child ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Remove Confirm Modal ───────────────────────────────────────────────────────

function RemoveConfirmModal({ child, onClose, onConfirm, removing }: {
  child: Child; onClose: () => void; onConfirm: () => void; removing: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Remove {child.first_name}?
          </h3>
          <p className="text-sm mb-6" style={{ color: '#6B7A6B' }}>
            This unlinks {child.first_name} from your parent account. Their lessons and bookings are not deleted.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#F5F0E8', color: '#1B5E37' }}>Cancel</button>
            <button onClick={onConfirm} disabled={removing} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#DC2626' }}>
              {removing ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Child Card ─────────────────────────────────────────────────────────────────

function ChildCard({ child, onRemove }: { child: Child; onRemove: (child: Child) => void }) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 transition-all"
      style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B5E37, #2A7A4A)', color: '#fff' }}>
        {child.avatar_url
          ? <img src={child.avatar_url} alt="" className="w-full h-full object-cover" />
          : getInitials(child.first_name, child.last_name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ color: '#0D3D20' }}>{child.first_name} {child.last_name}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: '#9A9A8A' }}>{child.email}</p>
        {child.country && (
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5"
            style={{ background: 'rgba(27,94,55,0.08)', color: '#1B5E37' }}>{child.country}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a href="/platform/teachers"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(27,94,55,0.08)', color: '#1B5E37' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.08)'; (e.currentTarget as HTMLElement).style.color = '#1B5E37' }}>
          Book Teacher
        </a>
        <button onClick={() => onRemove(child)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(239,68,68,0.06)', color: '#DC2626' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)' }}>
          Remove
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ParentChildrenPage() {
  const supabase = createClient()
  const [children, setChildren]           = useState<Child[]>([])
  const [loading, setLoading]             = useState(true)
  const [parentId, setParentId]           = useState('')
  const [showAdd, setShowAdd]             = useState(false)
  const [removeTarget, setRemoveTarget]   = useState<Child | null>(null)
  const [removing, setRemoving]           = useState(false)
  const [toast, setToast]                 = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => { loadChildren() }, [])

  async function loadChildren() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    setParentId(user.id)

    const { data: links } = await (supabase as any)
      .from('parent_children')
      .select(`child_id, profiles!parent_children_child_id_fkey (id, first_name, last_name, email, avatar_url, country)`)
      .eq('parent_id', user.id)

    const list: Child[] = (links ?? []).map((r: any) => r.profiles).filter(Boolean)
    setChildren(list)
    setLoading(false)
  }

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  function handleChildAdded(child: Child) {
    setChildren(prev => [...prev, child])
    setShowAdd(false)
    showToast(`${child.first_name} has been added successfully! 🎉`, 'success')
  }

  async function handleRemoveConfirm() {
    if (!removeTarget) return
    setRemoving(true)
    try {
      const { error } = await (supabase as any).from('parent_children')
        .delete().eq('parent_id', parentId).eq('child_id', removeTarget.id)
      if (error) throw error
      setChildren(prev => prev.filter(c => c.id !== removeTarget.id))
      showToast(`${removeTarget.first_name} has been removed.`, 'success')
      setRemoveTarget(null)
    } catch {
      showToast('Failed to remove. Please try again.', 'error')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div>
      {toast && (
        <div className="fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background: toast.type === 'success' ? '#1B5E37' : '#DC2626', color: '#fff' }}>
          {toast.msg}
        </div>
      )}

      {showAdd && (
        <AddChildModal
          parentId={parentId}
          existingChildIds={children.map(c => c.id)}
          onClose={() => setShowAdd(false)}
          onSuccess={handleChildAdded}
        />
      )}

      {removeTarget && (
        <RemoveConfirmModal
          child={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onConfirm={handleRemoveConfirm}
          removing={removing}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>Family</p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>My Children</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>Manage your children&apos;s accounts and their Quran learning journey.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex-shrink-0"
          style={{ background: '#1B5E37', boxShadow: '0 4px 12px rgba(27,94,55,0.25)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
        >
          <span className="text-base">+</span> Add Child
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : children.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: '#fff', border: '2px dashed rgba(27,94,55,0.15)' }}>
          <div className="text-5xl mb-4">👶</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>No children added yet</h3>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#8A9A8A' }}>
            Link your child&apos;s existing student account, or create a new one for them.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: '#1B5E37', boxShadow: '0 4px 14px rgba(27,94,55,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
          >
            + Add Your First Child
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map(child => (
            <ChildCard key={child.id} child={child} onRemove={setRemoveTarget} />
          ))}
          <button
            onClick={() => setShowAdd(true)}
            className="w-full rounded-2xl py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{ background: 'transparent', border: '2px dashed rgba(27,94,55,0.2)', color: '#1B5E37' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.04)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <span className="text-lg">+</span> Add Another Child
          </button>
        </div>
      )}

      {!loading && children.length > 0 && (
        <div className="mt-8 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #0D3D20, #1B5E37)' }}>
          <p className="text-sm font-semibold text-white mb-1">{children.length} {children.length === 1 ? 'child' : 'children'} enrolled</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
            To book a teacher for a child, click &quot;Book Teacher&quot; next to their name or go to Browse Teachers.
          </p>
        </div>
      )}
    </div>
  )
}
