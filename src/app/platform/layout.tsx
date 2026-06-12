'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'student' | 'teacher' | 'parent' | 'admin'

interface NavItem {
  label: string
  href: string
  icon: string
}

const studentNav: NavItem[] = [
  { label: 'Dashboard',       href: '/platform/student/dashboard', icon: '🏠' },
  { label: 'Browse Teachers', href: '/platform/teachers',          icon: '🔍' },
  { label: 'My Bookings',     href: '/platform/student/bookings',  icon: '📅' },
  { label: 'My Lessons',      href: '/platform/student/lessons',   icon: '📚' },
  { label: 'Profile',         href: '/platform/student/profile',   icon: '👤' },
]

const teacherNav: NavItem[] = [
  { label: 'Dashboard',    href: '/platform/teacher/dashboard',    icon: '🏠' },
  { label: 'Verification', href: '/platform/teacher/verification', icon: '✅' },
  { label: 'My Courses',   href: '/platform/teacher/courses',      icon: '📖' },
  { label: 'Bookings',     href: '/platform/teacher/bookings',     icon: '📅' },
  { label: 'Profile',      href: '/platform/teacher/profile',      icon: '👤' },
]

const parentNav: NavItem[] = [
  { label: 'Dashboard',       href: '/platform/parent/dashboard', icon: '🏠' },
  { label: 'My Children',     href: '/platform/parent/children',  icon: '👨‍👩‍👧' },
  { label: 'Billing',         href: '/platform/parent/billing',   icon: '💳' },
  { label: 'Browse Teachers', href: '/platform/teachers',         icon: '🔍' },
]

// ── Role badge colours — brand-consistent ──────────────────────────────────────
// Teacher → green (brand primary)
// Student → gold/amber (brand secondary)
// Parent  → same gold tone
// Admin   → dark green
const roleBadge: Record<UserRole, { bg: string; text: string; label: string }> = {
  teacher: { bg: '#1B5E37',  text: '#ffffff',  label: 'Teacher' },
  student: { bg: '#B8952A',  text: '#ffffff',  label: 'Student' },
  parent:  { bg: '#B8952A',  text: '#ffffff',  label: 'Parent'  },
  admin:   { bg: '#0D3D20',  text: '#D4AF50',  label: 'Admin'   },
}

async function fetchProfile(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('role, first_name, last_name')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as { role: string; first_name: string | null; last_name: string | null }
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({
  nav, role, userName, onSignOut,
}: {
  nav: NavItem[]
  role: UserRole
  userName: string
  onSignOut: () => void
}) {
  const pathname = usePathname()
  const badge = roleBadge[role] ?? roleBadge.student

  return (
    <aside
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      className="hidden md:flex flex-col w-56 bg-white border-r border-[#E8E4DA] min-h-screen fixed top-0 left-0 z-40"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-5 py-4 border-b border-[#F0EBE1]">
        <img src="/logo.png" alt="QMG" className="h-8 w-auto object-contain flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-[#0D3D20] leading-tight">Quran Mentor</p>
          <p className="text-xs font-semibold leading-tight" style={{ color: '#B8952A' }}>Global</p>
        </div>
      </Link>

      {/* User info */}
      <div className="px-4 py-3 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: '#1B5E37' }}
          >
            {userName[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0D3D20] truncate leading-tight">{userName}</p>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: badge.bg, color: badge.text }}
            >
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={
                active
                  ? { background: '#1B5E37', color: '#ffffff' }
                  : { color: '#4A5568' }
              }
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#F5F0E8' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span className="text-base w-5 text-center leading-none flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-2 pb-4 pt-2 border-t border-[#F0EBE1]">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
          style={{ color: '#888' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#DC2626' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#888' }}
        >
          <span className="text-base w-5 text-center leading-none flex-shrink-0">🚪</span>
          <span>Sign Out</span>
        </button>
        <p className="text-[10px] text-[#C0B9AD] mt-2 px-3">QuranMentorGlobal.com</p>
      </div>
    </aside>
  )
}

// ── Mobile bottom tabs ─────────────────────────────────────────────────────────

function BottomTabs({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E4DA] flex">
      {nav.slice(0, 5).map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            style={{ color: active ? '#1B5E37' : '#AAA' }}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[9px] font-semibold leading-tight">{item.label.split(' ')[0]}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// ── Root layout ────────────────────────────────────────────────────────────────

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole]         = useState<UserRole>('student')
  const [userName, setUserName] = useState('')
  const [ready, setReady]       = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const profile = await fetchProfile(supabase, user.id)
      if (!profile) { router.push('/auth/login'); return }
      setRole((profile.role as UserRole) ?? 'student')
      setUserName(`${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'User')
      setReady(true)
    }
    init()
  }, [])

  async function handleSignOut() {
    await fetch('/auth/signout', { method: 'POST' })
    router.push('/auth/login')
  }

  const navMap: Record<UserRole, NavItem[]> = {
    student: studentNav,
    teacher: teacherNav,
    parent:  parentNav,
    admin:   studentNav,
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: '#1B5E37', borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-[#888]">Loading…</p>
        </div>
      </div>
    )
  }

  const nav = navMap[role] ?? studentNav

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Sidebar nav={nav} role={role} userName={userName} onSignOut={handleSignOut} />
      <BottomTabs nav={nav} />
      {/* ml-56 matches sidebar w-56 · p-8 restores the original content padding */}
      <main className="md:ml-56 pb-20 md:pb-0 p-6 md:p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
