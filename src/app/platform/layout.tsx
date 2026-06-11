// src/app/platform/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

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

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: 'rgba(184,149,42,0.2)', border: '1px solid rgba(184,149,42,0.4)' }}>
        🕌
      </div>
      <div>
        <p className="text-white font-bold text-sm leading-tight">
          Quran<span style={{ color: '#D4AF50' }}>Mentor</span>Global
        </p>
      </div>
    </div>
  )
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [profile, setProfile] = useState<any>(null)
  const [verificationStatus, setVerificationStatus] = useState<string>('not_submitted')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (!prof) { router.replace('/auth/login'); return }
      setProfile(prof as any)

      if ((prof as any).role === 'teacher') {
        const { data: tp } = await supabase
          .from('teacher_profiles').select('status').eq('user_id', user.id).single()
        setVerificationStatus((tp as any)?.status || 'not_submitted')
      }
    }
    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  const isTeacher = profile?.role === 'teacher'
  const nav = isTeacher ? teacherNav : studentNav

  const initials = profile
    ? `${profile.first_name?.charAt(0) ?? ''}${profile.last_name?.charAt(0) ?? ''}`.toUpperCase()
    : '...'

  const statusEmoji: Record<string, string> = {
    pending:       '🟡',
    approved:      '✅',
    rejected:      '❌',
    not_submitted: '⬜',
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F5F0E8' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `} style={{ background: 'linear-gradient(180deg, #0D3D20 0%, #1B5E37 100%)' }}>

        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
          <Logo />
          <div className="text-[10px] text-white/40 tracking-widest uppercase mt-1.5 ml-11">
            {isTeacher ? 'Teacher Portal' : 'Student Portal'}
          </div>
        </div>

        {/* Verification badge for teachers */}
        {isTeacher && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-xl flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold text-white leading-tight">
              {statusEmoji[verificationStatus] || '⬜'} Verification
            </p>
            <p className="text-xs mt-0.5" style={{
              color: verificationStatus === 'approved' ? '#86EFAC'
                : verificationStatus === 'rejected' ? '#FCA5A5'
                : verificationStatus === 'pending' ? '#FCD34D'
                : 'rgba(255,255,255,0.4)'
            }}>
              {verificationStatus === 'not_submitted' ? 'Not submitted yet'
                : verificationStatus === 'pending' ? 'Under review'
                : verificationStatus === 'approved' ? "You're live!"
                : 'Action needed'}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {nav.map(item => {
            const active = pathname === item.href
            const isCourses = item.href.includes('courses')
            const locked = isCourses && isTeacher && verificationStatus !== 'approved'

            return (
              <Link
                key={item.href}
                href={locked ? '#' : item.href}
                onClick={e => {
                  if (locked) { e.preventDefault(); return }
                  setSidebarOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: locked ? 'rgba(255,255,255,0.25)'
                    : active ? '#fff'
                    : 'rgba(255,255,255,0.65)',
                  cursor: locked ? 'not-allowed' : 'pointer',
                }}>
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {locked && <span className="text-xs">🔒</span>}
                {active && !locked && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#B8952A' }} />
                )}
                {item.href.includes('verification') && verificationStatus === 'pending' && (
                  <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                )}
                {item.href.includes('verification') && verificationStatus === 'rejected' && (
                  <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info + sign out */}
        <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)' }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} className="w-full h-full object-cover rounded-full" />
                : initials}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold leading-tight truncate">
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="text-white/40 text-xs capitalize">{profile?.role}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-all text-sm">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 w-full md:w-[calc(100%-16rem)] overflow-x-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden bg-green-dark px-4 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-30"
          style={{ background: '#0D3D20' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Logo />
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)' }}>
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
