'use client'
import { useEffect } from 'react'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

export default function AboutPage() {
  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>('.reveal,.reveal-left,.reveal-right,.reveal-up')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('visible'); obs.unobserve(e.target) } })
    }, { threshold: 0.12 })
    reveals.forEach(el => obs.observe(el))

    const stbtn = document.getElementById('stbtn')
    const onScroll = () => { if (stbtn) stbtn.style.opacity = window.scrollY > 400 ? '1' : '0' }
    window.addEventListener('scroll', onScroll)
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <>
      <style>{LANDING_CSS + `
        /* ── SCROLL REVEAL ── */
        .reveal{opacity:0;transform:translateY(36px);transition:opacity .7s var(--ease),transform .7s var(--ease)}.reveal.visible{opacity:1;transform:translateY(0)}
        .reveal-left{opacity:0;transform:translateX(-40px);transition:opacity .7s var(--ease),transform .7s var(--ease)}.reveal-left.visible{opacity:1;transform:translateX(0)}
        .reveal-right{opacity:0;transform:translateX(40px);transition:opacity .7s var(--ease),transform .7s var(--ease)}.reveal-right.visible{opacity:1;transform:translateX(0)}
        .d1{transition-delay:.1s}.d2{transition-delay:.18s}.d3{transition-delay:.26s}.d4{transition-delay:.34s}
        @media(prefers-reduced-motion:reduce){.reveal,.reveal-left,.reveal-right{opacity:1!important;transform:none!important;transition:none!important}}

        /* ── FLIP CARD ── */
        .flip-card{perspective:1000px}
        .flip-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .65s var(--ease)}
        .flip-card:hover .flip-inner{transform:rotateY(180deg)}
        .flip-front,.flip-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:inherit}
        .flip-back{transform:rotateY(180deg);background:linear-gradient(135deg,var(--green-dark),var(--green));display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center;gap:10px}
        .flip-back h4{font-family:var(--ff);font-size:19px;font-weight:700;color:#fff}
        .flip-back p{font-size:13px;color:rgba(255,255,255,.78);line-height:1.72}
        .flip-back .fbtn{display:inline-flex;align-items:center;gap:6px;background:var(--gold);color:#fff;font-size:13px;font-weight:700;padding:9px 22px;border-radius:50px;margin-top:6px;transition:transform .2s}
        .flip-back .fbtn:hover{transform:translateY(-2px)}
        .flip-back-ico{font-size:36px;margin-bottom:4px}
        @media(max-width:768px){.flip-inner{position:static;transform:none!important}.flip-back{display:none}.flip-front{position:static;transform:none}}

        /* ── FOUNDER ── */
        .founder{padding:100px 0;background:#fff;overflow:hidden}
        .founder-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .founder-imgw{position:relative}
        .founder-main{position:relative;border-radius:var(--rx);overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.14);aspect-ratio:4/5;background:var(--cream-d)}
        .founder-main img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;display:block}
        .founder-badge{position:absolute;bottom:-20px;right:-20px;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border-radius:16px;padding:18px 22px;box-shadow:0 8px 32px rgba(27,94,55,.35);text-align:center;animation:floatSlow 5s ease-in-out infinite}
        @keyframes floatSlow{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .founder-badge .num{font-family:var(--ff);font-size:28px;font-weight:800;color:var(--gold-light);line-height:1}
        .founder-badge .lbl{font-size:11px;color:rgba(255,255,255,.65);margin-top:3px}
        .founder-creds{display:flex;flex-direction:column;gap:16px;margin-bottom:32px}
        .cred{display:flex;gap:15px;padding:14px;border-radius:12px;transition:all .25s}
        .cred:hover{background:var(--cream);transform:translateX(4px)}
        .cred-ico{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,var(--green),var(--green-mid));display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .cred-b h4{font-size:15px;font-weight:700;color:var(--green-dark);margin-bottom:3px}
        .cred-b p{font-size:13px;color:var(--tl);line-height:1.6}

        /* ── WHY WE BUILT THIS ── */
        .why{padding:100px 0;background:var(--cream);overflow:hidden}
        .why-item{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;margin-bottom:80px}
        .why-item:last-child{margin-bottom:0}
        .why-item.reverse{direction:rtl}.why-item.reverse > *{direction:ltr}
        .why-img{position:relative;border-radius:var(--rx);overflow:hidden;aspect-ratio:4/3;background:var(--cream-d);box-shadow:var(--shl);transition:transform .4s var(--ease)}
        .why-img:hover{transform:scale(1.02)}
        .why-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
        .why-img:hover img{transform:scale(1.05)}
        .why-tag{display:inline-flex;align-items:center;gap:8px;background:var(--gold-pale);color:var(--green-dark);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:6px 14px;border-radius:50px;margin-bottom:16px}

        /* ── MISSION — flip cards ── */
        .mission{padding:100px 0;background:#fff;overflow:hidden}
        .mgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .mcard{height:280px;border-radius:20px;perspective:1000px;cursor:pointer}
        .mc-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .65s var(--ease)}
        .mcard:hover .mc-inner{transform:rotateY(180deg)}
        .mc-front{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:var(--cream);border-radius:20px;border:1px solid var(--cream-d);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center;transition:box-shadow .3s}
        .mcard:hover .mc-front{box-shadow:0 20px 50px rgba(0,0,0,.09)}
        .mc-front::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--green),var(--gold));border-radius:20px 20px 0 0;transform:scaleX(0);transition:transform .4s;transform-origin:left}
        .mcard:hover .mc-front::before{transform:scaleX(1)}
        .mc-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);background:linear-gradient(135deg,var(--green-dark),var(--green));border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center;gap:10px}
        .mc-back h4{font-family:var(--ff);font-size:18px;font-weight:700;color:#fff}
        .mc-back p{font-size:13px;color:rgba(255,255,255,.78);line-height:1.7}
        .mcard-ico{font-size:44px;margin-bottom:14px}
        .mc-front h3{font-family:var(--ff);font-size:20px;font-weight:700;color:var(--green-dark);margin-bottom:8px}
        .mc-front p{font-size:13px;color:var(--tl);line-height:1.65}
        @media(max-width:768px){.mc-inner{position:static;transform:none!important}.mc-back{display:none}.mc-front{position:static;transform:none;height:auto}.mcard{height:auto}}

        /* ── STATS ── */
        .stats-row{padding:80px 0;background:linear-gradient(135deg,var(--green) 0%,var(--green-dark) 100%)}
        .sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center}
        .si{transition:transform .3s}.si:hover{transform:translateY(-6px)}
        .si .big{font-family:var(--ff);font-size:clamp(38px,5vw,54px);font-weight:800;color:var(--gold-light);line-height:1;margin-bottom:8px}
        .si .lbl{font-size:14px;color:rgba(255,255,255,.62)}

        .page-hero{background-color:var(--green-dark)}
        #stbtn{position:fixed;bottom:28px;right:28px;width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border:none;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:200;opacity:0;transition:all .4s;box-shadow:0 4px 20px rgba(27,94,55,.4)}
        #stbtn:hover{transform:translateY(-4px) scale(1.05)}

        @media(max-width:900px){.founder-inner{grid-template-columns:1fr;gap:48px}.why-item,.why-item.reverse{grid-template-columns:1fr;gap:32px;direction:ltr}.mgrid{grid-template-columns:1fr 1fr}.sgrid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:540px){.mgrid{grid-template-columns:1fr}.founder,.why,.mission{padding:64px 0}}
      `}</style>

      <LandingNav />

      {/* HERO */}
      <section className="page-hero" style={{backgroundImage:"url('/images/about/about-hero.png')"}}>
        <div className="page-hero-bg" style={{backgroundImage:"url('/images/about/about-hero.png')"}}></div>
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link><span className="sep">›</span><span>About Us</span></div>
          <div className="sl center wh reveal">Our Story</div>
          <h1 className="reveal d2">Born from <span>Purpose</span>,<br/>Built on Faith</h1>
          <p className="reveal d3">Learn how a Hafiz-e-Quran with a vision set out to make authentic Quranic education accessible to every Muslim on earth.</p>
          <Link href="/auth/signup" className="btn btn-gold reveal d4">Book Free Trial Lesson ✦</Link>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="founder">
        <div className="container">
          <div className="founder-inner">
            <div className="founder-imgw reveal-left">
              <div className="founder-main">
                <img src="/images/founder/founder.png" alt="Hafiz Awais — Founder" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
              <div className="founder-badge"><div className="num">Hafiz</div><div className="lbl">e-Quran · ACCA</div></div>
            </div>
            <div className="reveal-right">
              <div className="sl">The Founder</div>
              <h2 className="st">Meet <span>Hafiz Awais</span></h2>
              <p className="ss">Hafiz Awais completed his Hifz at a young age and went on to pursue professional studies in accounting (ACCA). But the love for Quran education never left him — it grew into a calling.</p>
              <p className="ss" style={{marginTop:16,marginBottom:28}}>He noticed a recurring problem: Muslim families in the West, Gulf, and even Pakistan struggling to find qualified, trustworthy Quran teachers for their children. The solution became Quran Mentor Global.</p>
              <div className="founder-creds">
                {[
                  { ico:'📖', title:'Hafiz-e-Quran',      desc:'Memorized the complete Quran at a young age with full Tajweed under certified Qaris' },
                  { ico:'🎓', title:'ACCA Professional',   desc:'Qualified accountant — bringing professional standards and accountability to online education' },
                  { ico:'🌍', title:'Global Vision',       desc:'Passionate about connecting the worldwide Ummah through the sacred bond of Quranic learning' },
                ].map((c, i) => (
                  <div className="cred" key={i}><div className="cred-ico">{c.ico}</div><div className="cred-b"><h4>{c.title}</h4><p>{c.desc}</p></div></div>
                ))}
              </div>
              <Link href="/auth/signup" className="btn btn-green">Start Learning Today →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY WE BUILT THIS */}
      <section className="why">
        <div className="container">
          <div className="section-hd reveal">
            <div className="sl center">Why We Built This</div>
            <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>Three Problems.<br/><span>One Solution.</span></h2>
            <p className="ss" style={{margin:'0 auto 64px',textAlign:'center'}}>We built Quran Mentor Global to solve real challenges facing Muslim families worldwide.</p>
          </div>
          {[
            { img:'/images/about/mission.png',       tag:'🕌 Accessibility', h:'Quality Education Was <span>Hard to Find</span>',   p1:'Millions of Muslims worldwide — especially in the West — struggle to find qualified, local Quran teachers. Long waitlists, high costs, and geographic barriers kept families from proper Quranic education.', p2:'We removed every barrier. On Quran Mentor Global, a student in London gets the same quality teacher as someone in Lahore — from their own home, at a time that suits them.', rev:false },
            { img:'/images/about/vision.png',        tag:'✅ Trust & Quality', h:'Finding a <span>Trustworthy</span> Teacher Was Risky', p1:'Online platforms offered no verification. Parents had no way to know if a teacher was truly qualified, safe, or experienced — especially for their children.',                                   p2:'Every teacher on our platform holds verified Ijazah certification, passes a background check, and builds a reputation through transparent student reviews before they can teach.', rev:true  },
            { img:'/images/about/global-impact.png', tag:'🌍 Global Impact',  h:'The Ummah Needed <span>One Platform</span>',         p1:'Muslim communities across 100+ countries share the same goal — connecting with the Quran. Yet there was no single trusted home for this.',                                                    p2:'Quran Mentor Global is building that home. One Ummah, one mission, one platform — uniting learners from Pakistan to London to Houston to Dubai around the words of Allah.',      rev:false },
          ].map((row, i) => (
            <div className={`why-item${row.rev ? ' reverse' : ''}`} key={i}>
              <div className={`why-img ${row.rev ? 'reveal-right' : 'reveal-left'}`}>
                <img src={row.img} alt={row.tag} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
              <div className={row.rev ? 'reveal-left' : 'reveal-right'}>
                <div className="why-tag">{row.tag}</div>
                <h3 className="st" dangerouslySetInnerHTML={{__html: row.h}} />
                <p className="ss" style={{marginBottom:20}}>{row.p1}</p>
                <p style={{fontSize:14,color:'var(--tl)',lineHeight:1.7}}>{row.p2}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION — flip cards */}
      <section className="mission">
        <div className="container">
          <div className="section-hd reveal">
            <div className="sl center">Our Mission</div>
            <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>Three Principles That <span>Guide Us</span></h2>
            <p className="ss" style={{margin:'0 auto 64px',textAlign:'center'}}>Everything we build, every decision we make, is grounded in these beliefs.</p>
          </div>
          <div className="mgrid">
            {[
              { ico:'🕌', title:'Accessibility First', front:'Every Muslim — regardless of location, age, or background — deserves access to quality Quranic education.', back:'We remove every barrier between a student and their teacher — geographic, financial, and logistical. Learning the Quran is a right, not a privilege.' },
              { ico:'✅', title:'Quality & Trust',     front:'We verify every teacher before they teach. Ijazah certification, background checks, and student reviews ensure you always get the best.', back:'Our 4-step verification process — credentials, identity, teaching assessment, and ongoing student ratings — guarantees every teacher meets our strict standard.' },
              { ico:'🌍', title:'Global Community',   front:'We are building a worldwide community of learners united by the Quran — from Pakistan to London to Houston to Dubai.', back:'One Ummah, one mission, one platform. QuranMentorGlobal connects 10,000+ students across 100+ countries through the shared love of Allah\'s words.' },
            ].map((m, i) => (
              <div className={`mcard reveal d${i + 1}`} key={i}>
                <div className="mc-inner">
                  <div className="mc-front">
                    <div className="mcard-ico">{m.ico}</div>
                    <h3>{m.title}</h3>
                    <p>{m.front}</p>
                  </div>
                  <div className="mc-back">
                    <div className="flip-back-ico">{m.ico}</div>
                    <h4>{m.title}</h4>
                    <p>{m.back}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-row">
        <div className="container">
          <div className="sgrid">
            {[{big:'10K+',lbl:'Happy Students'},{big:'500+',lbl:'Certified Teachers'},{big:'100+',lbl:'Countries Connected'},{big:'4.9★',lbl:'Average Rating'}].map((s,i) => (
              <div className={`si reveal d${i+1}`} key={i}><div className="big">{s.big}</div><div className="lbl">{s.lbl}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* HADITH */}
      <div className="hadith">
        <div className="container">
          <p className="hadith-ar reveal">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
          <p className="hadith-en reveal d2">"The best among you are those who learn the Quran and teach it."</p>
          <p className="hadith-src reveal d3">— Sahih Al-Bukhari</p>
        </div>
      </div>

      {/* CTA */}
      <section style={{padding:'100px 0',background:'var(--cream)'}}>
        <div className="container" style={{textAlign:'center'}}>
          <div className="sl center reveal">Join Us</div>
          <h2 className="st reveal d2" style={{textAlign:'center',margin:'0 auto 16px'}}>Begin Your <span>Quranic Journey</span></h2>
          <p className="ss reveal d3" style={{margin:'0 auto 32px',textAlign:'center'}}>Join thousands of students worldwide who have found their perfect Quran teacher through our platform.</p>
          <div className="reveal d4" style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/auth/signup" className="btn btn-gold">Sign Up Free ✦</Link>
            <Link href="/platform/teachers" className="btn btn-outline-green">Browse Teachers →</Link>
          </div>
        </div>
      </section>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
