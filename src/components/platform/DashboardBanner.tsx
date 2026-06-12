'use client'

// ─────────────────────────────────────────────────────────────────────────────
// DashboardBanner — auto-sliding image banner for platform dashboards
//
// IMAGE SETUP (do this in GitHub):
//   1. Create folder: public/banners/
//   2. Add your images with EXACT filenames below:
//
//   STUDENT banners (generate in ChatGPT, landscape 1200×400px):
//     public/banners/student-1.jpg  — A focused student learning Quran on laptop, warm green tones
//     public/banners/student-2.jpg  — Quran open on desk, study notes, cozy Islamic study environment
//     public/banners/student-3.jpg  — Muslim child learning with a teacher via video call, smiling
//
//   TEACHER banners (generate in ChatGPT, landscape 1200×400px):
//     public/banners/teacher-1.jpg  — Confident Islamic teacher at desk with Quran, professional setting
//     public/banners/teacher-2.jpg  — Teacher writing Arabic calligraphy, books around, warm lighting
//     public/banners/teacher-3.jpg  — Qari teacher recording a lesson, camera and Quran on desk
//
//   PARENT banners (generate in ChatGPT, landscape 1200×400px):
//     public/banners/parent-1.jpg   — Parent and child sitting together reading Quran, warm home setting
//     public/banners/parent-2.jpg   — Mother watching child's online Quran lesson on a tablet, smiling
//     public/banners/parent-3.jpg   — Family together with Quran, soft golden evening light
//
//   ChatGPT prompt template (replace [DESCRIPTION]):
//   "Professional banner image for an online Quran learning platform. [DESCRIPTION].
//    Warm green and gold color palette. High quality, no text, landscape orientation 1200x400."
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'

type Role = 'student' | 'teacher' | 'parent'

interface BannerSlide {
  src: string
  alt: string
  headline: string
  sub: string
}

const slides: Record<Role, BannerSlide[]> = {
  student: [
    {
      src: '/banners/student-1.jpg',
      alt: 'Student learning Quran',
      headline: 'Continue Your Journey',
      sub: 'Every lesson brings you closer to Allah.',
    },
    {
      src: '/banners/student-2.jpg',
      alt: 'Quran study environment',
      headline: 'Deepen Your Understanding',
      sub: 'Tajweed, Hifz, Tafseer — learn at your pace.',
    },
    {
      src: '/banners/student-3.jpg',
      alt: 'Live Quran lesson',
      headline: 'Your Teacher is Ready',
      sub: 'Book your next lesson in seconds.',
    },
  ],
  teacher: [
    {
      src: '/banners/teacher-1.jpg',
      alt: 'Quran teacher at desk',
      headline: 'Welcome Back, Teacher',
      sub: 'Your students are waiting for your guidance.',
    },
    {
      src: '/banners/teacher-2.jpg',
      alt: 'Arabic calligraphy teacher',
      headline: 'Share Your Knowledge',
      sub: 'Earn while teaching the words of Allah.',
    },
    {
      src: '/banners/teacher-3.jpg',
      alt: 'Teacher recording lesson',
      headline: 'Grow Your Students',
      sub: 'Complete verification to go live on the platform.',
    },
  ],
  parent: [
    {
      src: '/banners/parent-1.jpg',
      alt: 'Parent and child with Quran',
      headline: 'Nurture Their Journey',
      sub: "Track your child's progress every step of the way.",
    },
    {
      src: '/banners/parent-2.jpg',
      alt: 'Mother watching online lesson',
      headline: 'Learning, Supervised',
      sub: 'Safe, certified teachers for your children.',
    },
    {
      src: '/banners/parent-3.jpg',
      alt: 'Family with Quran',
      headline: 'A Gift for Life',
      sub: 'Give your child the Quran — the greatest inheritance.',
    },
  ],
}

// Fallback gradient shown before images load or if image is missing
const fallbackGradient: Record<Role, string> = {
  student: 'linear-gradient(135deg, #1B5E37 0%, #2A7A4A 50%, #0D3D20 100%)',
  teacher: 'linear-gradient(135deg, #0D3D20 0%, #1B5E37 50%, #B8952A 100%)',
  parent:  'linear-gradient(135deg, #B8952A 0%, #1B5E37 50%, #0D3D20 100%)',
}

export default function DashboardBanner({ role }: { role: Role }) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded]   = useState<boolean[]>([false, false, false])
  const list = slides[role] ?? slides.student

  // Auto-advance every 4 seconds
  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % list.length), 4000)
    return () => clearInterval(id)
  }, [list.length])

  function markLoaded(i: number) {
    setLoaded(prev => { const n = [...prev]; n[i] = true; return n })
  }

  const slide = list[current]

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden mb-8"
      style={{ height: 180, background: fallbackGradient[role] }}
    >
      {/* Preload all images silently */}
      {list.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt=""
          aria-hidden
          onLoad={() => markLoaded(i)}
          style={{ display: 'none' }}
        />
      ))}

      {/* Slides */}
      {list.map((s, i) => (
        <div
          key={s.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {loaded[i] && (
            <img
              src={s.src}
              alt={s.alt}
              className="w-full h-full object-cover"
            />
          )}
          {/* Dark overlay for text legibility */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(13,61,32,0.72) 0%, rgba(13,61,32,0.3) 60%, transparent 100%)' }}
          />
        </div>
      ))}

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col justify-center px-8" style={{ zIndex: 2 }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#D4AF50' }}>
          QuranMentorGlobal
        </p>
        <h2
          className="font-bold mb-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(18px, 2.5vw, 26px)',
            color: '#fff',
            lineHeight: 1.2,
          }}
        >
          {slide.headline}
        </h2>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{slide.sub}</p>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 right-5 flex gap-1.5" style={{ zIndex: 2 }}>
        {list.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              background: i === current ? '#D4AF50' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
