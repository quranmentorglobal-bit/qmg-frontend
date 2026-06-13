'use client'
import { useState, useEffect } from 'react'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

const TEACHERS = [
  { spec:'tajweed hifz', img:'/images/teachers/teacher-1.png', name:'Qari Abdullah',  title:'Tajweed & Hifz Specialist',       origin:'Pakistan',     flag:'🇵🇰', exp:'12 yrs', rating:'4.9', reviews:'142', langs:['English','Urdu'],    tags:['Hafs','Adults','Tajweed'], rate:'$12/hr', back:'Specializes in correcting Tajweed errors and guiding Hifz students through their memorization journey with proven daily revision systems.' },
  { spec:'tafseer tajweed', img:'/images/teachers/teacher-2.png', name:'Sheikh Ibrahim', title:'Tafseer & Advanced Quran',         origin:'Saudi Arabia', flag:'🇸🇦', exp:'15 yrs', rating:'4.8', reviews:'98',  langs:['Arabic','English'], tags:['Tafseer','Advanced'],      rate:'$15/hr', back:'A renowned scholar with an Ijazah in Tafseer. Brings deep contextual understanding and Arabic fluency to every session.' },
  { spec:'qaida kids',    img:'/images/teachers/teacher-3.png', name:'Qari Yusuf',     title:'Noorani Qaida · Kids Specialist',  origin:'Pakistan',     flag:'🇵🇰', exp:'8 yrs',  rating:'5.0', reviews:'207', langs:['English','Urdu'],    tags:['Kids','Beginners'],        rate:'$10/hr', back:'Rated 5.0 stars by 207 students. Uses proven phonics-based methods that make Arabic feel natural and fun for young learners.' },
  { spec:'hifz',         img:'/images/teachers/teacher-4.png', name:'Ustadh Bilal',   title:'Hifz · Memorization',              origin:'Egypt',        flag:'🇪🇬', exp:'10 yrs', rating:'4.9', reviews:'175', langs:['Arabic','English'], tags:['Hifz','Ijazah'],           rate:'$14/hr', back:'Completed his own Hifz at age 12. Runs a structured Hifz programme with smart spaced repetition and weekly milestone reviews.' },
  { spec:'tajweed kids', img:'/images/teachers/teacher-5.png', name:'Qari Hassan',    title:'Tajweed for All Ages',             origin:'United Kingdom',flag:'🇬🇧', exp:'6 yrs',  rating:'4.7', reviews:'83',  langs:['English','Urdu'],    tags:['Tajweed','Kids'],          rate:'$11/hr', back:'Based in the UK, understands the challenges Western-born Muslims face with Arabic. Makes Tajweed accessible and relatable for all ages.' },
  { spec:'tafseer hifz', img:'/images/teachers/teacher-6.png', name:'Sheikh Tariq',   title:'Tafseer & Hifz Programme',         origin:'Saudi Arabia', flag:'🇸🇦', exp:'20 yrs', rating:'4.9', reviews:'321', langs:['Arabic','Urdu'],    tags:['Scholar','Advanced'],      rate:'$18/hr', back:'20 years of teaching experience. Holds multiple Ijazahs and has taught students who have gone on to become Huffaz and scholars themselves.' },
]

export default function TeachersLandingPage() {
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>('.reveal,.reveal-up')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('visible'); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    reveals.forEach(el => obs.observe(el))
    const stbtn = document.getElementById('stbtn')
    const onScroll = () => { if (stbtn) stbtn.style.opacity = window.scrollY > 400 ? '1' : '0' }
    window.addEventListener('scroll', onScroll)
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  const filtered = filter === 'all' ? TEACHERS : TEACHERS.filter(t => t.spec.includes(filter))

  return (
    <>
      <style>{LANDING_CSS + `
        .reveal{opacity:0;transform:translateY(36px);transition:opacity .7s var(--ease),transform .7s var(--ease)}.reveal.visible{opacity:1;transform:translateY(0)}
        .reveal-up{opacity:0;transform:translateY(20px);transition:opacity .6s var(--ease),transform .6s var(--ease)}.reveal-up.visible{opacity:1;transform:translateY(0)}
        .d1{transition-delay:.08s}.d2{transition-delay:.16s}.d3{transition-delay:.24s}.d4{transition-delay:.32s}.d5{transition-delay:.40s}.d6{transition-delay:.48s}
        @media(prefers-reduced-motion:reduce){.reveal,.reveal-up{opacity:1!important;transform:none!important;transition:none!important}}

        .filter-bar{background:var(--cream);border-bottom:1px solid var(--cream-d);padding:18px 0}
        .filter-bar .container{display:flex;gap:10px;flex-wrap:wrap}
        .ftab{padding:8px 20px;border-radius:50px;border:1.5px solid var(--cream-d);background:#fff;font-size:13px;font-weight:600;color:var(--tm);cursor:pointer;transition:all .25s;font-family:var(--fb)}
        .ftab.active,.ftab:hover{background:var(--green);color:#fff;border-color:var(--green)}

        .teachers-main{padding:80px 0;background:#fff}
        .tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}

        /* Flip teacher cards */
        .tc{height:460px;border-radius:20px;perspective:1000px;cursor:pointer}
        .tc-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .65s var(--ease)}
        .tc:hover .tc-inner{transform:rotateY(180deg)}
        .tc-front{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:#fff;border-radius:20px;overflow:hidden;border:1px solid var(--cream-d);box-shadow:0 4px 20px rgba(0,0,0,.06);display:flex;flex-direction:column;transition:box-shadow .3s,border-color .3s}
        .tc:hover .tc-front{box-shadow:0 20px 50px rgba(0,0,0,.12);border-color:var(--gold-pale)}
        .tc-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);background:linear-gradient(135deg,var(--green-dark),var(--green));border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center;gap:10px}
        .tc-back-av{width:70px;height:70px;border-radius:50%;overflow:hidden;border:3px solid var(--gold);flex-shrink:0;position:relative;margin-bottom:4px}
        .tc-back-av img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;display:block}
        .tc-back h4{font-family:var(--ff);font-size:19px;font-weight:700;color:#fff}
        .tc-back .tc-back-spec{font-size:12px;color:var(--gold-light);font-weight:600}
        .tc-back p{font-size:13px;color:rgba(255,255,255,.78);line-height:1.65}
        .tc-back .fbtn{display:inline-flex;align-items:center;gap:6px;background:var(--gold);color:#fff;font-size:13px;font-weight:700;padding:9px 22px;border-radius:50px;transition:transform .2s}
        .tc-back .fbtn:hover{transform:translateY(-2px)}

        .tc-img{position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;background:var(--cream-d);flex-shrink:0}
        .tc-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;transition:transform .5s;display:block}
        .tc:hover .tc-img img{transform:scale(1.05)}
        .tc-verified{position:absolute;top:12px;right:12px;background:var(--green);color:#fff;font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px}
        .tc-flag{position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,.55);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;backdrop-filter:blur(4px)}
        .tc-body{padding:18px}
        .tc-name{font-family:var(--ff);font-size:17px;font-weight:700;color:var(--green-dark);margin-bottom:3px}
        .tc-spec{font-size:12px;color:var(--gold);font-weight:600;margin-bottom:6px}
        .tc-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        .tc-stars{color:var(--gold);font-size:12px}
        .tc-reviews{font-size:11px;color:var(--tl)}
        .tc-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
        .tc-tag{font-size:11px;background:var(--cream);color:var(--tm);padding:3px 9px;border-radius:20px;font-weight:500}
        .tc-foot{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--cream-d)}
        .tc-lang{font-size:11px;color:var(--tl)}
        .tc-rate{font-size:13px;font-weight:700;color:var(--green-dark)}

        /* Verification cards */
        .verify-sec{padding:80px 0;background:var(--cream)}
        .vgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
        .vcard{background:#fff;border-radius:16px;padding:28px 20px;text-align:center;border:1px solid var(--cream-d);transition:all .3s}
        .vcard:hover{box-shadow:0 12px 36px rgba(0,0,0,.09);transform:translateY(-5px);border-color:var(--gold-pale)}
        .vcard-num{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;font-family:var(--ff);font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
        .vcard h4{font-family:var(--ff);font-size:16px;font-weight:700;color:var(--green-dark);margin-bottom:8px}
        .vcard p{font-size:13px;color:var(--tl);line-height:1.6}

        .hero-badges{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:24px}
        .hero-badge{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.9);font-size:13px;font-weight:500;padding:7px 16px;border-radius:50px}
        .page-hero{background-color:var(--green-dark)}
        .page-hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; z-index:-1; display:block; }

        #stbtn{position:fixed;bottom:28px;right:28px;width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border:none;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:200;opacity:0;transition:all .4s;box-shadow:0 4px 20px rgba(27,94,55,.4)}
        #stbtn:hover{transform:translateY(-4px) scale(1.05)}

        @media(max-width:900px){.tgrid{grid-template-columns:repeat(2,1fr)}.vgrid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:768px){.tc{height:auto}.tc-inner{position:static;transform:none!important}.tc-back{display:none}.tc-front{position:static;transform:none}}
        @media(max-width:540px){.tgrid{grid-template-columns:1fr}}
      `}</style>

      <LandingNav />

      <section className="page-hero" style={{backgroundImage:"url('/images/teachers/teachers-hero.png')"}}>
        <div className="page-hero-bg" style={{backgroundImage:"url('/images/teachers/teachers-hero.png')"}}></div>
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link><span className="sep">›</span><span>Our Teachers</span></div>
          <div className="sl center wh reveal">500+ Certified Qaris</div>
          <h1 className="reveal d2">Learn from the <span>Best</span><br/>Quran Teachers</h1>
          <p className="reveal d3">Every teacher is thoroughly verified — Ijazah-certified, background-checked, and rated by real students before joining our platform.</p>
          <Link href="/auth/signup" className="btn btn-gold reveal d4">Book Free Trial Lesson ✦</Link>
          <div className="hero-badges reveal d5">
            {['✅ Verified Ijazah','🔒 Background Checked','⭐ Student Rated','🌍 Multiple Languages'].map((b,i) => (
              <div className="hero-badge" key={i}>{b}</div>
            ))}
          </div>
        </div>
      </section>

      <div className="filter-bar">
        <div className="container">
          {[{val:'all',label:'All Teachers'},{val:'tajweed',label:'Tajweed'},{val:'hifz',label:'Hifz'},{val:'kids',label:'Kids Specialist'},{val:'tafseer',label:'Tafseer'},{val:'qaida',label:'Noorani Qaida'}].map(f => (
            <button key={f.val} className={`ftab${filter===f.val?' active':''}`} onClick={() => setFilter(f.val)}>{f.label}</button>
          ))}
        </div>
      </div>

      <section className="teachers-main">
        <div className="container">
          <div className="tgrid">
            {filtered.map((t, i) => (
              <div className={`tc reveal d${(i % 3) + 1}`} key={i}>
                <div className="tc-inner">
                  {/* Front */}
                  <div className="tc-front">
                    <div className="tc-img">
                      <img src={t.img} alt={t.name} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <span className="tc-verified">✓ Ijazah</span>
                      <span className="tc-flag">{t.flag} {t.origin}</span>
                    </div>
                    <div className="tc-body">
                      <div className="tc-name">{t.name}</div>
                      <div className="tc-spec">{t.title}</div>
                      <div className="tc-meta">
                        <div><span className="tc-stars">{'★'.repeat(Math.floor(parseFloat(t.rating)))}</span> <strong style={{fontSize:12}}>{t.rating}</strong></div>
                        <span className="tc-reviews">({t.reviews} reviews)</span>
                      </div>
                      <div className="tc-tags">{t.tags.map((tag,j) => <span className="tc-tag" key={j}>{tag}</span>)}</div>
                      <div className="tc-foot">
                        <span className="tc-lang">🗣 {t.langs.join(' · ')}</span>
                        <span className="tc-rate">{t.rate}</span>
                      </div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="tc-back">
                    <div className="tc-back-av">
                      <img src={t.img} alt={t.name} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                    <h4>{t.name}</h4>
                    <div className="tc-back-spec">{t.flag} {t.origin} · {t.exp}</div>
                    <p>{t.back}</p>
                    <Link href="/platform/teachers" className="fbtn">Book Trial →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:56}}>
            <p style={{fontSize:14,color:'var(--tl)',marginBottom:20}}>Showing sample profiles. Browse all real verified teachers on the platform.</p>
            <Link href="/platform/teachers" className="btn btn-gold">Browse All Teachers on Platform ✦</Link>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="verify-sec">
        <div className="container">
          <div className="section-hd reveal">
            <div className="sl center">Our Standard</div>
            <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>How We <span>Verify</span> Every Teacher</h2>
            <p className="ss" style={{margin:'0 auto 56px',textAlign:'center'}}>Our 4-step verification ensures every teacher meets our strict quality and safety standards.</p>
          </div>
          <div className="vgrid">
            {[
              {n:'1',title:'Application Review',  desc:'Teacher submits credentials, Ijazah certificate, and experience. Our team reviews every detail carefully.'},
              {n:'2',title:'Identity Verification',desc:'Government-issued ID verified and background check conducted for the safety of all students.'},
              {n:'3',title:'Teaching Assessment', desc:'Live teaching demonstration reviewed by our academic team. Tajweed and methodology evaluated.'},
              {n:'4',title:'Student Ratings',     desc:'Once live, teachers build reputation through verified student reviews. Quality maintained through feedback.'},
            ].map((v,i) => (
              <div className={`vcard reveal d${i+1}`} key={i}>
                <div className="vcard-num">{v.n}</div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hadith">
        <div className="container">
          <p className="hadith-ar reveal">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
          <p className="hadith-en reveal d2">"The best among you are those who learn the Quran and teach it."</p>
          <p className="hadith-src reveal d3">— Sahih Al-Bukhari</p>
        </div>
      </div>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
