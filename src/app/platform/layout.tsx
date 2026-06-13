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

const roleConfig: Record<UserRole, { label: string; subtag: string; dashHref: string }> = {
  student: { label: 'Student', subtag: 'STUDENT PORTAL',  dashHref: '/platform/student/dashboard' },
  teacher: { label: 'Teacher', subtag: 'TEACHER PORTAL',  dashHref: '/platform/teacher/dashboard' },
  parent:  { label: 'Parent',  subtag: 'PARENT PORTAL',   dashHref: '/platform/parent/dashboard'  },
  admin:   { label: 'Admin',   subtag: 'ADMIN PORTAL',    dashHref: '/platform/student/dashboard' },
}

const navMap: Record<UserRole, NavItem[]> = {
  student: studentNav,
  teacher: teacherNav,
  parent:  parentNav,
  admin:   studentNav,
}

// ── Nav Link ───────────────────────────────────────────────────────────────────

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
      style={
        active
          ? { background: '#1B5E37', color: '#fff' }
          : { color: 'rgba(255,255,255,0.65)' }
      }
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <span className="text-base w-5 text-center leading-none flex-shrink-0">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  )
}

// ── Desktop Sidebar ────────────────────────────────────────────────────────────

function Sidebar({ nav, role, userName, onSignOut }: {
  nav: NavItem[]
  role: UserRole
  userName: string
  onSignOut: () => void
}) {
  const pathname = usePathname()
  const cfg = roleConfig[role]

  return (
    <aside
      className="hidden lg:flex flex-col w-56 min-h-screen fixed top-0 left-0 z-40 shadow-xl"
      style={{ background: '#0D3D20' }}
    >
      {/* Logo */}
      <Link
        href={cfg.dashHref}
        className="flex items-center gap-2.5 px-5 py-5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.08)', textDecoration: 'none' }}
      >
        <img src="/logo.png" alt="QMG" className="h-8 w-auto object-contain flex-shrink-0" />
        <div style={{ lineHeight: 1 }}>
          <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#fff', letterSpacing: '-0.2px' }}>
            Quran<span style={{ color: '#D4AF50' }}>Mentor</span>Global
          </p>
          <p className="text-[9px] font-semibold tracking-widest mt-1" style={{ color: 'rgba(212,175,80,0.7)' }}>
            {cfg.subtag}
          </p>
        </div>
      </Link>

      {/* User info */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: '#B8952A', color: '#fff' }}
          >
            {userName[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#fff' }}>{userName}</p>
            <p className="text-xs" style={{ color: '#D4AF50' }}>{cfg.label}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return <NavLink key={item.href} item={item} active={active} />
        })}
      </nav>

      {/* Sign out + footer */}
      <div className="px-3 pb-5 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.color = '#FCA5A5'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <span className="text-base w-5 text-center">🚪</span>
          <span>Sign Out</span>
        </button>
        <p className="text-[9px] px-3 mt-3" style={{ color: 'rgba(255,255,255,0.18)' }}>
          QuranMentorGlobal.com
        </p>
      </div>
    </aside>
  )
}

// ── Mobile Top Bar ─────────────────────────────────────────────────────────────

function MobileTopBar({ nav, role, userName, onSignOut }: {
  nav: NavItem[]
  role: UserRole
  userName: string
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const cfg = roleConfig[role]

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      {/* Top bar */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 shadow-md"
        style={{ background: '#0D3D20' }}
      >
        {/* Logo */}
        <Link href={cfg.dashHref} className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="QMG" className="h-7 w-auto object-contain" />
          <div>
            <p className="text-xs font-bold leading-tight" style={{ color: '#fff' }}>
              Quran<span style={{ color: '#D4AF50' }}>Mentor</span>Global
            </p>
            <p className="text-[8px] font-semibold tracking-wider" style={{ color: 'rgba(212,175,80,0.7)' }}>
              {cfg.subtag}
            </p>
          </div>
        </Link>

        {/* Right side: avatar + hamburger */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#B8952A', color: '#fff' }}
          >
            {userName[0]?.toUpperCase() ?? '?'}
          </div>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5 transition-colors"
            style={{ background: open ? 'rgba(255,255,255,0.12)' : 'transparent' }}
            aria-label="Menu"
          >
            <span
              className="block h-0.5 w-5 rounded-full transition-all duration-200"
              style={{
                background: '#fff',
                transform: open ? 'translateY(4px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block h-0.5 w-5 rounded-full transition-all duration-200"
              style={{
                background: '#fff',
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="block h-0.5 w-5 rounded-full transition-all duration-200"
              style={{
                background: '#fff',
                transform: open ? 'translateY(-4px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className="lg:hidden fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          background: '#0D3D20',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 h-14 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: '#B8952A', color: '#fff' }}
            >
              {userName[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#fff' }}>{userName}</p>
              <p className="text-xs" style={{ color: '#D4AF50' }}>{cfg.label}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Nav items in drawer */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {nav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return <NavLink key={item.href} item={item} active={active} onClick={() => setOpen(false)} />
          })}
        </nav>

        {/* Sign out in drawer */}
        <div className="px-4 pb-8 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => { setOpen(false); onSignOut() }}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-left transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.color = '#FCA5A5'
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            <span className="text-base w-5 text-center">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}

// ── Loading Screen ─────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin mx-auto mb-4"
          style={{ borderColor: '#1B5E37', borderTopColor: 'transparent' }}
        />
        <p className="text-sm font-medium" style={{ color: '#1B5E37' }}>Loading…</p>
      </div>
    </div>
  )
}

// ── Root Layout ────────────────────────────────────────────────────────────────

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole]     = useState<UserRole>('student')
  const [userName, setName] = useState('')
  const [ready, setReady]   = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await (supabase as any)
        .from('profiles')
        .select('role, first_name, last_name')
        .eq('id', user.id)
        .single()

      if (!data) { router.push('/auth/login'); return }

      setRole((data.role as UserRole) ?? 'student')
      setName(`${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || 'User')
      setReady(true)
    }
    init()
  }, [])

  async function handleSignOut() {
    await fetch('/auth/signout', { method: 'POST' })
    router.push('/auth/login')
  }

  if (!ready) return <LoadingScreen />

  const nav = navMap[role] ?? studentNav

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Desktop sidebar */}
      <Sidebar nav={nav} role={role} userName={userName} onSignOut={handleSignOut} />

      {/* Mobile top bar */}
      <MobileTopBar nav={nav} role={role} userName={userName} onSignOut={handleSignOut} />

      {/* Main content */}
      {/* lg:ml-56 matches sidebar width. pt-14 on mobile offsets the top bar. */}
      <main className="lg:ml-56 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
