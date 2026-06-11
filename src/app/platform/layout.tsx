// src/app/platform/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

const studentNav = [
  { href: '/platform/student/dashboard', label: 'Dashboard',     icon: '🏠' },
  { href: '/platform/student/bookings',  label: 'My Bookings',   icon: '📅' },
  { href: '/platform/student/lessons',   label: 'My Lessons',    icon: '📖' },
  { href: '/platform/student/profile',   label: 'Profile',       icon: '👤' },
]

const teacherNav = [
  { href: '/platform/teacher/dashboard', label: 'Dashboard',    icon: '🏠' },
  { href: '/platform/teacher/bookings',  label: 'Bookings',     icon: '📅' },
  { href: '/platform/teacher/courses',   label: 'My Courses',   icon: '📚' },
  { href: '/platform/teacher/profile',   label: 'Profile',      icon: '👤' },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      </div>
      <div>
        <div className="font-display text-base font-bold text-white leading-tight">
          Quran<span className="text-gold">Mentor</span>Global
        </div>
      </div>
    </div>
  )
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [profile, setProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
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

  return (
    <div className="min-h-screen bg-cream flex">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-green-dark flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <Logo />
          <div className="text-[10px] text-white/40 tracking-widest uppercase mt-1.5 ml-10">
            {isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'}
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
          {nav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />}
              </Link>
            )
          })}
        </nav>

        {/* User info + sign out */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
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
            className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-all text-sm"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 w-0 md:w-auto">

        {/* ── Mobile top bar ── */}
        <header className="md:hidden bg-green-dark px-4 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Logo />
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
