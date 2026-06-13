'use client'

import { useEffect, useRef, useState } from 'react'

type Role = 'student' | 'teacher' | 'parent'

interface BannerSlide {
  src: string
  alt: string
  headline: string
  sub: string
}

const slides: Record<Role, BannerSlide[]> = {
  student: [
    { src: '/banners/student-1.png', alt: 'Student learning Quran', headline: 'Continue Your Journey',      sub: 'Every lesson brings you closer to Allah.' },
    { src: '/banners/student-2.png', alt: 'Quran study environment', headline: 'Deepen Your Understanding', sub: 'Tajweed, Hifz, Tafseer — learn at your pace.' },
    { src: '/banners/student-3.png', alt: 'Live Quran lesson',       headline: 'Your Teacher is Ready',     sub: 'Book your next lesson in seconds.' },
  ],
  teacher: [
    { src: '/banners/teacher-1.png', alt: 'Quran teacher at desk',      headline: 'Welcome Back, Teacher', sub: 'Your students are waiting for your guidance.' },
    { src: '/banners/teacher-2.png', alt: 'Arabic calligraphy teacher', headline: 'Share Your Knowledge',  sub: 'Earn while teaching the words of Allah.' },
    { src: '/banners/teacher-3.png', alt: 'Teacher recording lesson',   headline: 'Grow Your Students',    sub: 'Complete verification to go live on the platform.' },
  ],
  parent: [
    { src: '/banners/parent-1.png', alt: 'Parent and child with Quran',   headline: 'Nurture Their Journey', sub: "Track your child's progress every step of the way." },
    { src: '/banners/parent-2.png', alt: 'Mother watching online lesson', headline: 'Learning, Supervised',  sub: 'Safe, certified teachers for your children.' },
    { src: '/banners/parent-3.png', alt: 'Family with Quran',             headline: 'A Gift for Life',       sub: 'Give your child the Quran — the greatest inheritance.' },
  ],
}

// Subtle warm-toned fallback gradients — NOT heavy green
const fallbackGradient: Record<Role, string> = {
  student: 'linear-gradient(120deg, #1a3a28 0%, #2d5a3d 55%, #3a4a20 100%)',
  teacher: 'linear-gradient(120deg, #1a3020 0%, #2d4a30 40%, #7a6010 100%)',
  parent:  'linear-gradient(120deg, #1a3020 0%, #2d4a35 45%, #6a5010 100%)',
}

export default function DashboardBanner({ role }: { role: Role }) {
  const [current, setCurrent]   = useState(0)
  const [imgError, setImgError] = useState<Record<number, boolean>>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const list = slides[role] ?? slides.student

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % list.length), 4500)
  }

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [list.length])

  function goTo(i: number) { setCurrent(i); startTimer() }

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden mb-8"
      style={{
        aspectRatio: '1300 / 340',
        maxHeight: 340,
        minHeight: 150,
        background: fallbackGradient[role],
      }}
    >
      {/* Slides */}
      {list.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          {!imgError[i] && (
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover"
              onError={() => setImgError(prev => ({ ...prev, [i]: true }))}
            />
          )}
          {/* Much lighter overlay — just enough for text, not a green wall */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(10,40,22,0.65) 0%, rgba(10,40,22,0.35) 45%, rgba(10,40,22,0.05) 100%)',
            }}
          />
        </div>
      ))}

      {/* Text */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10" style={{ zIndex: 10 }}>
        <p
          className="font-semibold tracking-widest uppercase mb-1"
          style={{ color: '#D4AF50', fontSize: 'clamp(9px, 1vw, 11px)' }}
        >
          QuranMentorGlobal
        </p>
        <h2
          className="font-bold mb-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(16px, 2.8vw, 28px)',
            color: '#fff',
            lineHeight: 1.2,
          }}
        >
          {list[current].headline}
        </h2>
        <p style={{ fontSize: 'clamp(11px, 1.4vw, 15px)', color: 'rgba(255,255,255,0.85)' }}>
          {list[current].sub}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="absolute flex gap-1.5" style={{ bottom: 14, right: 18, zIndex: 10 }}>
        {list.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? 22 : 7,
              height: 7,
              borderRadius: 4,
              background: i === current ? '#D4AF50' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
