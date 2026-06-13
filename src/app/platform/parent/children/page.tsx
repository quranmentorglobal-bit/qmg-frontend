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
  age?: number | null
}

type Step = 'list' | 'add' | 'confirm-remove'

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#EDE6D6] rounded-xl ${className}`} />
}

// ── Add Child Modal ────────────────────────────────────────────────────────────

interface AddChildForm {
  first_name: string
  last_name: string
  email: string
  password: string
  age: string
  country: string
  gender: string
  quran_level: string
  notes: string
}

const BLANK_FORM: AddChildForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  age: '',
  country: '',
  gender: '',
  quran_level: '',
  notes: '',
}

const COUNTRIES = ['Pakistan', 'United Kingdom', 'United States', 'United Arab Emirates', 'Saudi Arabia', 'Canada', 'Australia', 'Other']
const QURAN_LEVELS = ['Complete Beginner', 'Learning Qaida', 'Reading Quran (Nazra)', 'Learning Tajweed', 'Memorising (Hifz)', 'Advanced']

function AddChildModal({ onClose, onSuccess, parentId }: {
  onClose: () => void
  onSuccess: (child: Child) => void
  parentId: string
}) {
  const supabase = createClient()
  const [form, setForm]       = useState<AddChildForm>(BLANK_FORM)
  const [step, setStep]       = useState<1 | 2>(1)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  function set(field: keyof AddChildForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function validateStep1() {
    if (!form.first_name.trim()) return 'First name is required'
    if (!form.last_name.trim())  return 'Last name is required'
    if (!form.email.trim())      return 'Email is required'
    if (!form.email.includes('@')) return 'Enter a valid email'
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  function nextStep() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setStep(2)
  }

  async function handleSubmit() {
    if (!form.first_name || !form.email || !form.password) {
      setError('Please complete all required fields'); return
    }
    setSaving(true)
    setError('')

    try {
      // 1. Create the child's Supabase Auth account
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

      // 2. Wait a moment for the trigger to create the profile
      await new Promise(r => setTimeout(r, 800))

      // 3. Update the child's profile with extra details
      await (supabase as any)
        .from('profiles')
        .update({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          country: form.country || null,
        })
        .eq('id', childUserId)

      // 4. Link child to parent in parent_children table
      const { error: linkError } = await (supabase as any)
        .from('parent_children')
        .insert({ parent_id: parentId, child_id: childUserId })

      if (linkError) throw new Error(linkError.message)

      // 5. Return the new child to the parent page
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
  }

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#5A6A5A',
    marginBottom: 5,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
      >
        {/* Modal header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #0D3D20, #1B5E37)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Add a Child
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Step {step} of 2 — {step === 1 ? 'Account Details' : 'Learning Profile'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 pb-2 flex gap-2">
          {[1, 2].map(n => (
            <div
              key={n}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{ background: n <= step ? '#1B5E37' : '#E0DDD5' }}
            />
          ))}
        </div>

        {/* Step 1 — Account */}
        {step === 1 && (
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm" style={{ color: '#6B7A6B' }}>
              Create a login account for your child. They can use these details to log in and access their lessons.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>First Name *</label>
                <input
                  style={inputStyle}
                  placeholder="Ahmed"
                  value={form.first_name}
                  onChange={e => set('first_name', e.target.value)}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input
                  style={inputStyle}
                  placeholder="Khan"
                  value={form.last_name}
                  onChange={e => set('last_name', e.target.value)}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Child&apos;s Email *</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="ahmed@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }}
              />
              <p className="text-xs mt-1" style={{ color: '#9A9A8A' }}>
                Can be a family email — just make it unique per child.
              </p>
            </div>

            <div>
              <label style={labelStyle}>Password *</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }}
              />
              <p className="text-xs mt-1" style={{ color: '#9A9A8A' }}>
                You control this password — share with child when needed.
              </p>
            </div>

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Learning profile */}
        {step === 2 && (
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm" style={{ color: '#6B7A6B' }}>
              Help us match your child with the right teacher and course.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Age</label>
                <input
                  style={inputStyle}
                  type="number"
                  placeholder="e.g. 8"
                  min="3"
                  max="18"
                  value={form.age}
                  onChange={e => set('age', e.target.value)}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1B5E37' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#E0DDD5' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select
                  style={inputStyle}
                  value={form.gender}
                  onChange={e => set('gender', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Country</label>
              <select
                style={inputStyle}
                value={form.country}
                onChange={e => set('country', e.target.value)}
              >
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Current Quran Level</label>
              <select
                style={inputStyle}
                value={form.quran_level}
                onChange={e => set('quran_level', e.target.value)}
              >
                <option value="">Select level</option>
                {QURAN_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Notes for Teacher <span style={{ color: '#B8B8A8', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                placeholder="e.g. Has memorised Juz Amma, needs help with Tajweed rules..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#1B5E37' }}
                onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#E0DDD5' }}
              />
            </div>

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Footer buttons */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ borderTop: '1px solid #F0EDE6' }}
        >
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#F5F0E8', color: '#1B5E37' }}
            >
              ← Back
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ color: '#9A9A8A' }}
          >
            Cancel
          </button>
          {step === 1 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: '#1B5E37' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: '#1B5E37' }}
              onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
            >
              {saving ? 'Creating account…' : 'Add Child ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Remove Confirm Modal ───────────────────────────────────────────────────────

function RemoveConfirmModal({ child, onClose, onConfirm, removing }: {
  child: Child
  onClose: () => void
  onConfirm: () => void
  removing: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Remove {child.first_name}?
          </h3>
          <p className="text-sm mb-6" style={{ color: '#6B7A6B' }}>
            This will unlink {child.first_name} from your parent account. Their lessons and bookings will not be deleted.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#F5F0E8', color: '#1B5E37' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={removing}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: '#DC2626' }}
            >
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
      style={{
        background: '#fff',
        border: '1px solid rgba(27,94,55,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B5E37, #2A7A4A)', color: '#fff' }}
      >
        {child.avatar_url
          ? <img src={child.avatar_url} alt="" className="w-full h-full object-cover" />
          : getInitials(child.first_name, child.last_name)
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ color: '#0D3D20' }}>
          {child.first_name} {child.last_name}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: '#9A9A8A' }}>{child.email}</p>
        {child.country && (
          <span
            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5"
            style={{ background: 'rgba(27,94,55,0.08)', color: '#1B5E37' }}
          >
            {child.country}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href="/platform/teachers"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(27,94,55,0.08)', color: '#1B5E37' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.08)'; (e.currentTarget as HTMLElement).style.color = '#1B5E37' }}
        >
          Book Teacher
        </a>
        <button
          onClick={() => onRemove(child)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(239,68,68,0.06)', color: '#DC2626' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)' }}
        >
          Remove
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ParentChildrenPage() {
  const supabase = createClient()
  const [children, setChildren]       = useState<Child[]>([])
  const [loading, setLoading]         = useState(true)
  const [parentId, setParentId]       = useState('')
  const [showAdd, setShowAdd]         = useState(false)
  const [removeTarget, setRemoveTarget] = useState<Child | null>(null)
  const [removing, setRemoving]       = useState(false)
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => { loadChildren() }, [])

  async function loadChildren() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    setParentId(user.id)

    const { data: links } = await (supabase as any)
      .from('parent_children')
      .select(`
        child_id,
        profiles!parent_children_child_id_fkey (
          id, first_name, last_name, email, avatar_url, country
        )
      `)
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
    showToast(`${child.first_name} has been added successfully!`, 'success')
  }

  async function handleRemoveConfirm() {
    if (!removeTarget) return
    setRemoving(true)
    try {
      const { error } = await (supabase as any)
        .from('parent_children')
        .delete()
        .eq('parent_id', parentId)
        .eq('child_id', removeTarget.id)

      if (error) throw error
      setChildren(prev => prev.filter(c => c.id !== removeTarget.id))
      showToast(`${removeTarget.first_name} has been removed.`, 'success')
      setRemoveTarget(null)
    } catch {
      showToast('Failed to remove child. Please try again.', 'error')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background: toast.type === 'success' ? '#1B5E37' : '#DC2626', color: '#fff', zIndex: 60 }}
        >
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddChildModal
          parentId={parentId}
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
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>
            Family
          </p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            My Children
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>
            Manage your children&apos;s accounts and track their Quran learning journey.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex-shrink-0"
          style={{ background: '#1B5E37', boxShadow: '0 4px 12px rgba(27,94,55,0.25)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
        >
          <span className="text-base">+</span>
          Add Child
        </button>
      </div>

      {/* Info banner */}
      <div
        className="rounded-2xl p-4 mb-8 flex items-start gap-3"
        style={{ background: 'rgba(184,149,42,0.08)', border: '1px solid rgba(184,149,42,0.2)' }}
      >
        <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#7A6010' }}>How adding children works</p>
          <p className="text-xs mt-0.5" style={{ color: '#8A7A30' }}>
            Each child gets their own student account with a separate email and password. You can then book teachers for them and track their progress from this parent account. All billing remains under your account.
          </p>
        </div>
      </div>

      {/* Children list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : children.length === 0 ? (
        /* Empty state */
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: '#fff', border: '2px dashed rgba(27,94,55,0.15)' }}
        >
          <div className="text-5xl mb-4">👶</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            No children added yet
          </h3>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#8A9A8A' }}>
            Add your child to get started. Each child gets their own student account so they can attend Quran lessons online.
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

          {/* Add another */}
          <button
            onClick={() => setShowAdd(true)}
            className="w-full rounded-2xl py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              background: 'transparent',
              border: '2px dashed rgba(27,94,55,0.2)',
              color: '#1B5E37',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.04)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <span className="text-lg">+</span>
            Add Another Child
          </button>
        </div>
      )}

      {/* Stats summary if children exist */}
      {!loading && children.length > 0 && (
        <div
          className="mt-8 rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0D3D20, #1B5E37)' }}
        >
          <p className="text-sm font-semibold text-white mb-1">
            {children.length} {children.length === 1 ? 'child' : 'children'} enrolled
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
            To book a teacher for a child, click &quot;Book Teacher&quot; next to their name, or go to Browse Teachers and select your child during checkout.
          </p>
        </div>
      )}
    </div>
  )
}
