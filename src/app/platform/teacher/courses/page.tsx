'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { CourseType } from '@/types/database'

const COURSE_LABELS: Record<CourseType, string> = {
  'Noorani Qaida': 'Noorani Qaida',
  'Tajweed': 'Tajweed',
  'Hifz': 'Hifz',
  'Tafseer': 'Tafseer',
  'Islamic Studies': 'Islamic Studies',
  'Ijazah': 'Ijazah',
}
const COURSE_ICONS: Record<CourseType, string> = {
  'Noorani Qaida': '🔤',
  'Tajweed': '🎵',
  'Hifz': '📖',
  'Tafseer': '🌙',
  'Islamic Studies': '☪️',
  'Ijazah': '🏅',
}
const COURSE_TYPES: CourseType[] = ['Noorani Qaida', 'Tajweed', 'Hifz', 'Tafseer', 'Islamic Studies', 'Ijazah']

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#E8E4DA] ${className}`} />
}

const EMPTY_FORM = { title: '', course_type: 'Tajweed' as CourseType, description: '', level: 'Beginner', age_group: 'All ages', duration_mins: 60, price_usd: 15, trial_price_usd: 5 }

export default function TeacherCourses() {
  const supabase = createClient()
  const router = useRouter()

  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

      setCourses((data as any) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function saveCourse() {
    if (!form.title.trim()) return
    setSaving(true)

    const { data, error } = await (supabase.from('courses') as any).insert([{
      teacher_id: userId,
      title: form.title,
      course_type: form.course_type,
      description: form.description || null,
      level: form.level,
      age_group: form.age_group,
      duration_mins: Number(form.duration_mins),
      price_usd: Number(form.price_usd),
      trial_price_usd: Number(form.trial_price_usd),
      max_students: 1,
      is_active: true,
    }]).select().single()

    if (!error && data) {
      setCourses(prev => [data, ...prev])
      setForm({ ...EMPTY_FORM })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function toggleActive(courseId: string, current: boolean) {
    await (supabase.from('courses') as any).update({ is_active: !current }).eq('id', courseId)
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_active: !current } : c))
  }

  async function deleteCourse(courseId: string) {
    if (!confirm('Delete this course?')) return
    await supabase.from('courses').delete().eq('id', courseId)
    setCourses(prev => prev.filter(c => c.id !== courseId))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0D3D20]">My Courses</h1>
          <p className="text-[#1B5E37]/60 text-sm mt-1">Manage the courses you offer to students.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#1B5E37] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0D3D20] transition-colors">
          {showForm ? '✕ Cancel' : '+ Add Course'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-[#D4C99A] p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-[#0D3D20] mb-4">New Course</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Course Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Tajweed for Beginners"
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Course Type</label>
              <select value={form.course_type} onChange={e => setForm(p => ({ ...p, course_type: e.target.value as CourseType }))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]">
                {COURSE_TYPES.map(t => <option key={t} value={t}>{COURSE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Level</label>
              <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]">
                {['Beginner', 'Intermediate', 'Advanced', 'All levels'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Age Group</label>
              <input value={form.age_group} onChange={e => setForm(p => ({ ...p, age_group: e.target.value }))}
                placeholder="e.g. All ages, Kids, Adults"
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Duration (minutes)</label>
              <input type="number" value={form.duration_mins} onChange={e => setForm(p => ({ ...p, duration_mins: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Price per hour (USD)</label>
              <input type="number" value={form.price_usd} onChange={e => setForm(p => ({ ...p, price_usd: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Trial Price (USD)</label>
              <input type="number" value={form.trial_price_usd} onChange={e => setForm(p => ({ ...p, trial_price_usd: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Description (optional)</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2} placeholder="Briefly describe what students will learn..."
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37] resize-none" />
            </div>
          </div>
          <button onClick={saveCourse} disabled={saving || !form.title.trim()}
            className="mt-4 bg-[#B8952A] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#9A7B22] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {loading ? [1,2].map(i => <Skeleton key={i} className="h-24 w-full" />) :
         courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D4C99A] p-12 text-center">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-[#0D3D20] font-semibold mb-1">No courses yet</p>
            <p className="text-[#1B5E37]/50 text-sm">Add your first course to start receiving bookings.</p>
          </div>
        ) : courses.map((c: any) => (
          <div key={c.id} className={`bg-white rounded-2xl border p-5 shadow-sm flex items-center gap-4 ${c.is_active ? 'border-[#D4C99A]' : 'border-gray-200 opacity-60'}`}>
            <div className="text-3xl flex-shrink-0">{COURSE_ICONS[c.course_type as CourseType] ?? '📖'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-[#0D3D20]">{c.title}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-[#1B5E37]/60 mt-0.5">{COURSE_LABELS[c.course_type as CourseType]} · {c.level} · {c.age_group} · {c.duration_mins} min</p>
              <p className="text-xs text-[#B8952A] font-semibold mt-0.5">${c.price_usd}/hr · Trial: ${c.trial_price_usd}</p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => toggleActive(c.id, c.is_active)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${c.is_active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                {c.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => deleteCourse(c.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
