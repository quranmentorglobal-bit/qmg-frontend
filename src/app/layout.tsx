// src/app/platform/layout.tsx
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'

const studentNav = [
  { href: '/platform/student/dashboard', label: 'Dashboard',      icon: '🏠' },
  { href: '/platform/teachers',          label: 'Browse Teachers', icon: '🎓' },
  { href: '/platform/student/bookings',  label: 'My Bookings',    icon: '📅' },
  { href: '/platform/student/profile',   label: 'Profile',        icon: '👤' },
]

const teacherNav = [
  { href: '/platform/teacher/dashboard',    label: 'Dashboard',    icon: '🏠' },
  { href: '/platform/teacher/verification', label: 'Verification', icon: '🛡️' },
  { href: '/platform/teacher/courses',      label: 'My Courses',   icon: '📚' },
  { href: '/platform/teacher/bookings',     label: 'Bookings',     icon: '📅' },
  { href: '/platform/teacher/profile',      label: 'Profile',      icon: '👤' },
]

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAuth()
  const nav = profile.role === 'teacher' ? teacherNav : studentNav

  // Get teacher verification status for the badge
  let verificationStatus = ''
  if (profile.role === 'teacher') {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data: tp } = await supabase
      .from('teacher_profiles')
      .select('status')
      .eq('user_id', profile.id)
      .single()
    verificationStatus = (tp as any)?.status || 'not_submitted'
  }

  const statusEmoji: Record<string, string> = {
    pending:       '🟡',
    approved:      '✅',
    rejected:      '❌',
    not_submitted: '⬜',
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F0E8' }}>

      {/* Sidebar */}
      <aside className="w-64 flex-col fixed h-full z-50 hidden md:flex"
        style={{ background: 'linear-gradient(180deg, #0D3D20 0%, #1B5E37 100%)' }}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'rgba(184,149,42,0.2)', border: '1px solid rgba(184,149,42,0.4)' }}>
              🕌
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Quran<span style={{ color: '#D4AF50' }}>Mentor</span>Global
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {profile.role === 'teacher' ? 'Teacher Portal' : 'Student Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* Verification badge for teachers */}
        {profile.role === 'teacher' && verificationStatus && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold text-white leading-tight">
              {statusEmoji[verificationStatus]} Verification Status
            </p>
            <p className="text-xs mt-0.5 capitalize"
              style={{
                color: verificationStatus === 'approved' ? '#86EFAC'
                  : verificationStatus === 'rejected' ? '#FCA5A5'
                  : verificationStatus === 'pending' ? '#FCD34D'
                  : 'rgba(255,255,255,0.4)'
              }}>
              {verificationStatus === 'not_submitted' ? 'Not submitted yet'
                : verificationStatus === 'pending' ? 'Under review'
                : verificationStatus === 'approved' ? 'Verified — you\'re live!'
                : 'Action needed'}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {nav.map(item => {
            const isCourses = item.href.includes('courses')
            const locked = isCourses && profile.role === 'teacher' && verificationStatus !== 'approved'
            return (
              <Link
                key={item.href}
                href={locked ? '#' : item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: locked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.65)',
                  cursor: locked ? 'not-allowed' : 'pointer',
                }}
                onClick={locked ? (e) => e.preventDefault() : undefined}>
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {locked && <span className="text-xs">🔒</span>}
                {item.href.includes('verification') && verificationStatus === 'pending' && (
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                )}
                {item.href.includes('verification') && verificationStatus === 'rejected' && (
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info + sign out */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)' }}>
              {(profile.first_name || '?')[0]}{(profile.last_name || '')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-xs capitalize truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {profile.role}
              </p>
            </div>
          </div>
          <form action="/auth/signout" method="POST">
            <button type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              🚪 <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: '#0D3D20' }}>
        <p className="text-white font-bold text-sm">
          Quran<span style={{ color: '#D4AF50' }}>Mentor</span>Global
        </p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{profile.first_name}</p>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen pt-14 md:pt-0">
        <div className="p-4 md:p-6 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
